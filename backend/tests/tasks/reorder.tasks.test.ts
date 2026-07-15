import { describe, it, expect } from 'vitest';
import { prisma } from '../../src/lib/prisma';
import { TaskService } from '../../src/modules/tasks/task.service';

describe('task reorder authorization', () => {
  it('rejects reorder attempts for viewers', async () => {
    const taskService = new TaskService();

    const uniqueSuffix = `${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const owner = await prisma.user.create({
      data: {
        email: `owner_${uniqueSuffix}@example.com`,
        firstName: 'Owner',
        lastName: 'Test',
        passwordHash: 'hash',
        isVerified: false,
      },
    });

    const viewer = await prisma.user.create({
      data: {
        email: `viewer_${uniqueSuffix}@example.com`,
        firstName: 'Viewer',
        lastName: 'Test',
        passwordHash: 'hash',
        isVerified: false,
      },
    });

    const workspace = await prisma.workspace.create({
      data: {
        name: `ws_${uniqueSuffix}`,
        slug: `ws_${uniqueSuffix}`,
        ownerId: owner.id,
      },
    });

    await prisma.workspaceMember.create({
      data: { workspaceId: workspace.id, userId: owner.id, role: 'ADMIN' },
    });
    await prisma.workspaceMember.create({
      data: { workspaceId: workspace.id, userId: viewer.id, role: 'VIEWER' },
    });

    const project = await prisma.project.create({
      data: { name: `proj_${uniqueSuffix}`, workspaceId: workspace.id, createdBy: owner.id },
    });

    const board = await prisma.board.create({
      data: { name: `board_${uniqueSuffix}`, projectId: project.id },
    });

    const column = await prisma.column.create({
      data: { name: `col_${uniqueSuffix}`, boardId: board.id, position: 1 },
    });

    const task = await prisma.task.create({
      data: {
        boardId: board.id,
        columnId: column.id,
        title: 'Task A',
        priority: 'MEDIUM',
        reporterId: owner.id,
        assigneeId: owner.id,
        position: 100,
      },
    });

    await expect(taskService.reorderTasks(column.id, viewer.id, [task.id])).rejects.toThrow(/permission/i);
  }, 60_000);
});
