import { TaskRepository } from './task.repository';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './task.dto';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../../src/utils/error';
import { prisma } from '../../../src/lib/prisma';
import { Priority } from '../../generated/prisma';
import { TaskPermissions } from './task.permissions';
import { resolveBoardAccess, resolveTaskAccess } from '../../../src/permissions/access-resolver';

const boardMoveLocks = new Map<string, Promise<void>>();

async function withBoardMoveLock<T>(boardId: string, fn: () => Promise<T>): Promise<T> {
  const prev = boardMoveLocks.get(boardId) ?? Promise.resolve();

  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });

  boardMoveLocks.set(boardId, current);

  try {
    await prev;
    return await fn();
  } finally {
    release();
    if (boardMoveLocks.get(boardId) === current) {
      boardMoveLocks.delete(boardId);
    }
  }
}

export class TaskService {

  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  private async checkColumnExists(columnId: string): Promise<void> {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
    });
    if (!column) {
      throw new NotFoundError('Column');
    }
  }

  async createTask(
    boardId: string,
    columnId: string,
    userId: string,
    data: CreateTaskDto,
  ) {
    const workspaceAccess = await resolveBoardAccess(boardId, userId);

    if (!TaskPermissions.canCreateTask(workspaceAccess.permissionRole)) {
      throw new ForbiddenError('You do not have permission to create tasks');
    }

    await this.checkColumnExists(columnId);

    const position = await this.taskRepository.getMaxPosition(columnId);

    return this.taskRepository.create({
      boardId,
      columnId,
      title: data.title,
      description: data.description,
      priority: data.priority || Priority.MEDIUM,
      dueDate: data.dueDate,
      reporterId: userId,
      assigneeId: data.assigneeId,
      position,
    });
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task');
    }

    await resolveBoardAccess(task.boardId, userId);

    return task;
  }

  async getColumnTasks(columnId: string, userId: string) {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      select: { boardId: true },
    });
    if (!column) {
      throw new NotFoundError('Column');
    }

    await resolveBoardAccess(column.boardId, userId);

    return this.taskRepository.findAllByColumn(columnId);
  }

  async getBoardTasks(boardId: string, userId: string) {
    await resolveBoardAccess(boardId, userId);
    return this.taskRepository.findAllByBoard(boardId);
  }

  async updateTask(taskId: string, userId: string, data: UpdateTaskDto) {
    const access = await resolveTaskAccess(taskId, userId);

    if (!TaskPermissions.canUpdateTask(
      access.permissionRole,
      access.reporterId,
      access.assigneeId,
      userId,
    )) {
      throw new ForbiddenError('You do not have permission to update this task');
    }

    return this.taskRepository.update(taskId, data);
  }

  async moveTask(taskId: string, userId: string, data: MoveTaskDto) {
    const access = await resolveTaskAccess(taskId, userId);

    if (!TaskPermissions.canMoveTask(
      access.permissionRole,
      access.reporterId,
      access.assigneeId,
      userId,
    )) {
      throw new ForbiddenError('You do not have permission to move this task');
    }

    await this.checkColumnExists(data.columnId);
    const targetColumn = await prisma.column.findUnique({
      where: { id: data.columnId },
      select: { boardId: true },
    });

    if (!targetColumn || targetColumn.boardId !== access.boardId) {
      throw new ForbiddenError('Cannot move task to a column outside its board');
    }

    return withBoardMoveLock(access.boardId, async () => {
      await prisma.$transaction(async (tx) => {
        const tasksInNewColumn = await tx.task.findMany({
          where: { columnId: data.columnId, deletedAt: null },
          select: { id: true },
          orderBy: { position: 'asc' },
        });

        const taskIdsInNewColumn = tasksInNewColumn.map((task) => task.id);
        const currentTaskIndex = taskIdsInNewColumn.indexOf(taskId);

        const normalizedPosition = Math.max(0, Math.min(data.position, taskIdsInNewColumn.length));
        const orderedTaskIds = [...taskIdsInNewColumn];

        if (currentTaskIndex >= 0) {
          orderedTaskIds.splice(currentTaskIndex, 1);
        }

        orderedTaskIds.splice(normalizedPosition, 0, taskId);

        for (const [index, orderedTaskId] of orderedTaskIds.entries()) {
          await tx.task.update({
            where: { id: orderedTaskId },
            data: {
              columnId: data.columnId,
              position: (index + 1) * 100,
            },
          });
        }
      }, {
        timeout: 20_000,
        maxWait: 20_000,
      });

      return this.taskRepository.findById(taskId);
    });
  }


  async deleteTask(taskId: string, userId: string, permanent = false) {
    const access = await resolveTaskAccess(taskId, userId);

    if (!TaskPermissions.canDeleteTask(access.permissionRole, access.reporterId, userId)) {
      throw new ForbiddenError('You do not have permission to delete this task');
    }

    if (permanent) {
      await this.taskRepository.hardDelete(taskId);
    } else {
      await this.taskRepository.softDelete(taskId);
    }
  }

  async getUserTasks(userId: string) {
    return this.taskRepository.findAllByAssignee(userId);
  }

  async reorderTasks(columnId: string, userId: string, taskIds: string[]) {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      select: { boardId: true },
    });
    if (!column) {
      throw new NotFoundError('Column');
    }

    const workspaceAccess = await resolveBoardAccess(column.boardId, userId);
    const tasks = await this.taskRepository.findAllByColumn(columnId);

    if (!TaskPermissions.canReorderTasks(workspaceAccess.permissionRole, tasks, userId)) {
      throw new ForbiddenError('You do not have permission to reorder tasks');
    }

    await prisma.$transaction(async (tx) => {
      const tasksInColumn = await tx.task.findMany({
        where: { columnId, deletedAt: null },
        select: { id: true },
        orderBy: { position: 'asc' },
      });

      const taskIdSet = new Set(tasksInColumn.map((task) => task.id));
      if (taskIds.length !== tasksInColumn.length || taskIds.some((id) => !taskIdSet.has(id))) {
        throw new BadRequestError('Invalid task reorder payload');
      }

      await Promise.all(
        taskIds.map((orderedTaskId, idx) =>
          tx.task.update({
            where: { id: orderedTaskId },
            data: { position: (idx + 1) * 100 },
          })
        )
      );
    }, {
      timeout: 20_000,
      maxWait: 20_000,
    });
  }

}
