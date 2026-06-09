import { TaskRepository } from './task.repository';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './task.dto';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../../src/utils/error';
import { prisma } from '../../../src/lib/prisma';
import { Role, Priority } from '../../generated/prisma';
import { TaskPermissions } from './task.permissions';

export class TaskService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  private async checkBoardAccess(boardId: string, userId: string): Promise<Role> {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        project: {
          include: {
            workspace: {
              include: {
                members: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundError('Board');
    }

    const member = board.project.workspace.members[0];
    if (!member) {
      throw new ForbiddenError('You do not have access to this board');
    }

    return member.role;
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
    const userRole = await this.checkBoardAccess(boardId, userId);
    
    if (!TaskPermissions.canCreateTask(userRole)) {
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

    await this.checkBoardAccess(task.boardId, userId);
    
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

    await this.checkBoardAccess(column.boardId, userId);
    
    return this.taskRepository.findAllByColumn(columnId);
  }

  async getBoardTasks(boardId: string, userId: string) {
    await this.checkBoardAccess(boardId, userId);
    return this.taskRepository.findAllByBoard(boardId);
  }

  async updateTask(taskId: string, userId: string, data: UpdateTaskDto) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task');
    }

    const userRole = await this.checkBoardAccess(task.boardId, userId);
    
    if (!TaskPermissions.canUpdateTask(
      userRole,
      task.reporterId,
      task.assigneeId,
      userId,
    )) {
      throw new ForbiddenError('You do not have permission to update this task');
    }

    return this.taskRepository.update(taskId, data);
  }

  async moveTask(taskId: string, userId: string, data: MoveTaskDto) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task');
    }

    const userRole = await this.checkBoardAccess(task.boardId, userId);
    
    if (!TaskPermissions.canMoveTask(
      userRole,
      task.reporterId,
      task.assigneeId,
      userId,
    )) {
      throw new ForbiddenError('You do not have permission to move this task');
    }

    await this.checkColumnExists(data.columnId);

    // Reorder tasks in the new column
    const tasksInNewColumn = await this.taskRepository.findAllByColumn(data.columnId);
    
    // Insert at the specified position
    let newPosition = data.position;
    if (newPosition >= tasksInNewColumn.length) {
      newPosition = tasksInNewColumn.length * 100 + 100;
    } else {
      // Shift tasks after insertion point
      for (let i = newPosition; i < tasksInNewColumn.length; i++) {
        await this.taskRepository.updatePosition(
          tasksInNewColumn[i].id,
          tasksInNewColumn[i].columnId,
          (i + 2) * 100,
        );
      }
      newPosition = (newPosition + 1) * 100;
    }

    return this.taskRepository.updatePosition(taskId, data.columnId, newPosition);
  }

  async deleteTask(taskId: string, userId: string, permanent = false) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task');
    }

    const userRole = await this.checkBoardAccess(task.boardId, userId);
    
    if (!TaskPermissions.canDeleteTask(userRole, task.reporterId, userId)) {
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

    const userRole = await this.checkBoardAccess(column.boardId, userId);
    
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenError('You do not have permission to reorder tasks');
    }

    await this.taskRepository.reorderTasks(columnId, taskIds);
  }
}