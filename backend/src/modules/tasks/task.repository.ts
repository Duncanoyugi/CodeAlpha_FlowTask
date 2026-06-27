import { prisma } from '../../../src/lib/prisma';
import { Task, Priority } from '../../generated/prisma';

export class TaskRepository {
  async create(data: {
    boardId: string;
    columnId: string;
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: Date;
    reporterId: string;
    assigneeId?: string;
    position: number;
  }): Promise<Task> {
    return prisma.task.create({
      data,
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { id, deletedAt: null },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        attachments: true,
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
    });
  }

  async findAllByColumn(columnId: string): Promise<Task[]> {
    return prisma.task.findMany({
      where: { columnId, deletedAt: null },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    });
  }

  async findAllByBoard(boardId: string): Promise<Task[]> {
    return prisma.task.findMany({
      where: { boardId, deletedAt: null },
      include: {
        column: true,
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
      },
      orderBy: [{ columnId: 'asc' }, { position: 'asc' }],
    });
  }

  async update(id: string, data: Partial<Task>): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async updatePosition(id: string, columnId: string, position: number): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data: {
        columnId,
        position,
      },
    });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await prisma.task.delete({
      where: { id },
    });
  }

  async getMaxPosition(columnId: string): Promise<number> {
    const maxPosition = await prisma.task.aggregate({
      where: { columnId },
      _max: { position: true },
    });
    return (maxPosition._max.position || 0) + 100;
  }

  async reorderTasks(columnId: string, taskIds: string[]): Promise<void> {
    // Repository-level implementation (non-transactional). For atomicity, prefer
    // calling TaskService methods that wrap this in prisma.$transaction.
    await Promise.all(
      taskIds.map((taskId, index) =>
        prisma.task.update({
          where: { id: taskId },
          data: { position: (index + 1) * 100 },
        })
      )
    );
  }


  async getColumnId(taskId: string): Promise<string | null> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { columnId: true },
    });
    return task?.columnId || null;
  }

  async getBoardId(taskId: string): Promise<string | null> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { boardId: true },
    });
    return task?.boardId || null;
  }

  async findAllByAssignee(assigneeId: string): Promise<Task[]> {
    return prisma.task.findMany({
      where: { assigneeId, deletedAt: null },
      include: {
        board: {
          include: {
            project: {
              include: {
                workspace: true,
              },
            },
          },
        },
        column: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}