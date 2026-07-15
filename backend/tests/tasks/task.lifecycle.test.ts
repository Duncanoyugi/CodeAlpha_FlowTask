import { describe, it, expect } from 'vitest';
import { prisma } from '../../src/lib/prisma';
import { TaskLifecycleService } from '../../src/modules/tasks/task.lifecycle.service';
import { Priority } from '../../src/generated/prisma';

const lifecycle = new TaskLifecycleService();

async function createMinimalTask({
  status,
  dueDate = null,
}: {
  status: string;
  dueDate?: Date | null;
}) {
  // Minimal workspace->project->board->column->task chain.
  const owner = await prisma.user.create({
    data: {
      email: `owner-${Math.random()}@example.com`,
      firstName: 'Owner',
      lastName: 'Test',
      passwordHash: 'x',
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      ownerId: owner.id,
      name: `ws-${Math.random()}`,
      slug: `ws-${Math.random()}`,
    },
  });

  await prisma.workspaceMember.create({
    data: { workspaceId: workspace.id, userId: owner.id, role: 'ADMIN' },
  });

  const project = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: `proj-${Math.random()}`,
      createdBy: owner.id,
    },
  });

  const board = await prisma.board.create({
    data: {
      projectId: project.id,
      name: `board-${Math.random()}`,
    },
  });

  const column = await prisma.column.create({
    data: {
      boardId: board.id,
      name: 'col',
      position: 0,
    },
  });

  const assignee = await prisma.user.create({
    data: {
      email: `assignee-${Math.random()}@example.com`,
      firstName: 'Assignee',
      lastName: 'Test',
      passwordHash: 'x',
    },
  });

  await prisma.workspaceMember.create({
    data: { workspaceId: workspace.id, userId: assignee.id, role: 'MEMBER' },
  });

  await prisma.projectMember.create({
    data: { projectId: project.id, userId: assignee.id },
  });

  // Task.status does not exist in schema. Seed completedAt directly for DONE status
  // to simulate a task already in DONE state without relying on status field.
  const task = await prisma.task.create({
    data: {
      boardId: board.id,
      columnId: column.id,
      title: 'task',
      priority: Priority.MEDIUM,
      dueDate: dueDate ?? undefined,
      reporterId: owner.id,
      assigneeId: assignee.id,
      position: 0,
      completedAt: status === 'DONE' ? new Date() : undefined,
    },
  });

  // Seed initial TaskStatusHistory only for DONE status.
  // Other tests verify the lifecycle service creates the first history row.
  if (status === 'DONE') {
    await prisma.taskStatusHistory.create({
      data: {
        taskId: task.id,
        fromStatus: 'IN_PROGRESS',
        toStatus: 'DONE',
        changedById: owner.id,
      },
    });
  }

  return {
    owner,
    workspace,
    project,
    board,
    column,
    assignee,
    task,
  };
}

describe('TaskLifecycleService.changeStatus', () => {
  it('creates a status history row on normal transitions', async () => {
    const { task, owner } = await createMinimalTask({ status: 'TODO' });

    await lifecycle.changeStatus(task.id, 'IN_PROGRESS', owner.id);

    const refreshed = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });
    expect(refreshed.completedAt).toBeNull();

    const history = await prisma.taskStatusHistory.findMany({
      where: { taskId: task.id },
      orderBy: { createdAt: 'asc' },
    });

    expect(history).toHaveLength(1);
    expect(history[0].fromStatus).toBe('TODO');
    expect(history[0].toStatus).toBe('IN_PROGRESS');
  });

  it('sets completedAt when entering DONE', async () => {
    const { task, owner } = await createMinimalTask({ status: 'IN_PROGRESS' });

    const updated = await lifecycle.changeStatus(task.id, 'DONE', owner.id);

    expect(updated.completedAt).not.toBeNull();

    const history = await prisma.taskStatusHistory.findMany({
      where: { taskId: task.id },
    });

    expect(history).toHaveLength(1);
    expect(history[0].fromStatus).toBe('IN_PROGRESS');
    expect(history[0].toStatus).toBe('DONE');
  });

  it('updates completedAt on subsequent DONE transitions and preserves history', async () => {
    const { task, owner } = await createMinimalTask({ status: 'IN_PROGRESS' });

    await lifecycle.changeStatus(task.id, 'DONE', owner.id);
    const completedAt1 = (
      await prisma.task.findUniqueOrThrow({ where: { id: task.id } })
    ).completedAt;

    await lifecycle.changeStatus(task.id, 'IN_PROGRESS', owner.id);

    await lifecycle.changeStatus(task.id, 'DONE', owner.id);
    const completedAt2 = (
      await prisma.task.findUniqueOrThrow({ where: { id: task.id } })
    ).completedAt;

    expect(completedAt1).not.toBeNull();
    expect(completedAt2).not.toBeNull();
    expect(new Date(completedAt2 as Date).getTime()).toBeGreaterThanOrEqual(
      (completedAt1 as Date).getTime()
    );

    const history = await prisma.taskStatusHistory.findMany({
      where: { taskId: task.id },
      orderBy: { createdAt: 'asc' },
    });

    // history rows: (inferred TODO->DONE), (DONE->IN_PROGRESS), (IN_PROGRESS->DONE)
    // toStatus values: TODO->DONE means inferred, but service creates IN_PROGRESS->DONE
    // Actually: bootstrap DONE=IN_PROGRESS, so first row is IN_PROGRESS->DONE
    // Then DONE->IN_PROGRESS, then IN_PROGRESS->DONE
    expect(history).toHaveLength(3);
    expect(history.map((h) => h.toStatus)).toEqual(['DONE', 'IN_PROGRESS', 'DONE']);
  });

  it('clears completedAt when leaving DONE', async () => {
    const { task, owner } = await createMinimalTask({ status: 'DONE' });

    const updated1 = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });
    expect(updated1.completedAt).not.toBeNull();

    await lifecycle.changeStatus(task.id, 'IN_PROGRESS', owner.id);

    const refreshed = await prisma.task.findUniqueOrThrow({ where: { id: task.id } });
    expect(refreshed.completedAt).toBeNull();

    const history = await prisma.taskStatusHistory.findMany({ where: { taskId: task.id } });
    expect(history.some((h) => h.toStatus === 'IN_PROGRESS')).toBe(true);
  });
});