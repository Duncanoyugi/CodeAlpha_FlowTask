import { describe, it, expect } from 'vitest';
import { prisma } from '../../src/lib/prisma';
import { TaskService } from '../../src/modules/tasks/task.service';


// Invariant-based concurrency test.
// We avoid strict final ordering expectations because position shifting is an implementation detail.
// We verify safety invariants: no duplicate positions and no missing/null positions for the moved tasks.

describe('Phase 2: moveTask concurrency invariants', () => {
  it('concurrent moves do not produce duplicate or null positions', async () => {

    const taskService = new TaskService();

    // Workspace + members
    const workspaceOwner = await prisma.user.create({
      data: {
        email: `owner_${Date.now()}@example.com`,
        firstName: 'Owner',
        lastName: 'Test',
        passwordHash: 'hash',
        isVerified: false,
      },
    });

    const workspace = await prisma.workspace.create({
      data: {
        name: `ws_${Date.now()}`,
        slug: `ws_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        ownerId: workspaceOwner.id,
      },
    });

    // Project + board
    const project = await prisma.project.create({
      data: {
        name: `proj_${Date.now()}`,
        workspaceId: workspace.id,
        createdBy: workspaceOwner.id,
      },
    });

    // Workspace access is required by assertProjectAccess (it checks workspaceMember first).
    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: workspaceOwner.id,
        role: 'ADMIN',
      },
    });

    // Ensure project access checks pass.
    // assertProjectAccess allows access when projectMembers has at least the current user.
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: workspaceOwner.id,
      },
    });

    const board = await prisma.board.create({
      data: {
        name: `board_${Date.now()}`,
        projectId: project.id,
      },
    });



    const column = await prisma.column.create({
      data: {
        name: `col_${Date.now()}`,
        boardId: board.id,
        position: 1,
      },
    });

    // Tasks: positions spaced by 100 per current implementation.
    await prisma.task.createMany({
      data: [
        {
          boardId: board.id,
          columnId: column.id,
          title: 'A',
          priority: 'MEDIUM',
          reporterId: workspaceOwner.id,
          assigneeId: workspaceOwner.id,
          position: 100,
        },
        {
          boardId: board.id,
          columnId: column.id,
          title: 'B',
          priority: 'MEDIUM',
          reporterId: workspaceOwner.id,
          assigneeId: workspaceOwner.id,
          position: 200,
        },
        {
          boardId: board.id,
          columnId: column.id,
          title: 'C',
          priority: 'MEDIUM',
          reporterId: workspaceOwner.id,
          assigneeId: workspaceOwner.id,
          position: 300,
        },
        {
          boardId: board.id,
          columnId: column.id,
          title: 'D',
          priority: 'MEDIUM',
          reporterId: workspaceOwner.id,
          assigneeId: workspaceOwner.id,
          position: 400,
        },
      ],
    });

    const seededTasks = await prisma.task.findMany({
      where: { columnId: column.id, deletedAt: null },
      select: { id: true, title: true, position: true, columnId: true },
      orderBy: { position: 'asc' },
    });

    expect(seededTasks.length).toBe(4);

    const taskByTitle = (t: string) => seededTasks.find((x) => x.title === t)!.id;

    const move1 = taskService.moveTask(taskByTitle('D'), workspaceOwner.id, {
      columnId: column.id,
      position: 0,
    } as any);

    const move2 = taskService.moveTask(taskByTitle('B'), workspaceOwner.id, {
      columnId: column.id,
      position: 3,
    } as any);

    await Promise.all([move1, move2]);

    const after = await prisma.task.findMany({
      where: { columnId: column.id, deletedAt: null },
      select: { id: true, position: true, columnId: true },
      orderBy: { position: 'asc' },
    });

    expect(after.length).toBe(4);

    const positions = after.map((t) => t.position);

    const taskRows = after.map((t) => {
      const seeded = seededTasks.find((s) => s.id === t.id);
      return {
        id: t.id,
        title: seeded?.title ?? t.id,
        position: t.position,
        columnId: t.columnId,
      };
    });

    // No duplicate positions
    const unique = new Set(positions);
    if (unique.size !== 4) {
      // eslint-disable-next-line no-console
      console.log('--- seededTasks ---', seededTasks);
      // eslint-disable-next-line no-console
      console.log('--- final after ---', taskRows);
    }
    expect(unique.size).toBe(4);


    // Ensure positions remain in expected numeric scheme for the current implementation.
    // (If you later switch to fractional positions, adjust this assertion.)
    expect(positions.every((p) => p % 100 === 0)).toBe(true);

    // Ensure all tasks still belong to the same column
    expect(after.every((t) => t.columnId === column.id)).toBe(true);
  });
});


