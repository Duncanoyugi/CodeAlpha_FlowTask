"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const task_repository_1 = require("./task.repository");
const error_1 = require("../../../src/utils/error");
const prisma_1 = require("../../../src/lib/prisma");
const prisma_2 = require("../../generated/prisma");
const task_permissions_1 = require("./task.permissions");
class TaskService {
    taskRepository;
    constructor() {
        this.taskRepository = new task_repository_1.TaskRepository();
    }
    async checkBoardAccess(boardId, userId) {
        const board = await prisma_1.prisma.board.findUnique({
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
            throw new error_1.NotFoundError('Board');
        }
        const member = board.project.workspace.members[0];
        if (!member) {
            throw new error_1.ForbiddenError('You do not have access to this board');
        }
        return member.role;
    }
    async checkColumnExists(columnId) {
        const column = await prisma_1.prisma.column.findUnique({
            where: { id: columnId },
        });
        if (!column) {
            throw new error_1.NotFoundError('Column');
        }
    }
    async createTask(boardId, columnId, userId, data) {
        const userRole = await this.checkBoardAccess(boardId, userId);
        if (!task_permissions_1.TaskPermissions.canCreateTask(userRole)) {
            throw new error_1.ForbiddenError('You do not have permission to create tasks');
        }
        await this.checkColumnExists(columnId);
        const position = await this.taskRepository.getMaxPosition(columnId);
        return this.taskRepository.create({
            boardId,
            columnId,
            title: data.title,
            description: data.description,
            priority: data.priority || prisma_2.Priority.MEDIUM,
            dueDate: data.dueDate,
            reporterId: userId,
            assigneeId: data.assigneeId,
            position,
        });
    }
    async getTaskById(taskId, userId) {
        const task = await this.taskRepository.findById(taskId);
        if (!task) {
            throw new error_1.NotFoundError('Task');
        }
        await this.checkBoardAccess(task.boardId, userId);
        return task;
    }
    async getColumnTasks(columnId, userId) {
        const column = await prisma_1.prisma.column.findUnique({
            where: { id: columnId },
            select: { boardId: true },
        });
        if (!column) {
            throw new error_1.NotFoundError('Column');
        }
        await this.checkBoardAccess(column.boardId, userId);
        return this.taskRepository.findAllByColumn(columnId);
    }
    async getBoardTasks(boardId, userId) {
        await this.checkBoardAccess(boardId, userId);
        return this.taskRepository.findAllByBoard(boardId);
    }
    async updateTask(taskId, userId, data) {
        const task = await this.taskRepository.findById(taskId);
        if (!task) {
            throw new error_1.NotFoundError('Task');
        }
        const userRole = await this.checkBoardAccess(task.boardId, userId);
        if (!task_permissions_1.TaskPermissions.canUpdateTask(userRole, task.reporterId, task.assigneeId, userId)) {
            throw new error_1.ForbiddenError('You do not have permission to update this task');
        }
        return this.taskRepository.update(taskId, data);
    }
    async moveTask(taskId, userId, data) {
        const task = await this.taskRepository.findById(taskId);
        if (!task) {
            throw new error_1.NotFoundError('Task');
        }
        const userRole = await this.checkBoardAccess(task.boardId, userId);
        if (!task_permissions_1.TaskPermissions.canMoveTask(userRole, task.reporterId, task.assigneeId, userId)) {
            throw new error_1.ForbiddenError('You do not have permission to move this task');
        }
        await this.checkColumnExists(data.columnId);
        // Reorder tasks in the new column
        const tasksInNewColumn = await this.taskRepository.findAllByColumn(data.columnId);
        // Insert at the specified position
        let newPosition = data.position;
        if (newPosition >= tasksInNewColumn.length) {
            newPosition = tasksInNewColumn.length * 100 + 100;
        }
        else {
            // Shift tasks after insertion point
            for (let i = newPosition; i < tasksInNewColumn.length; i++) {
                await this.taskRepository.updatePosition(tasksInNewColumn[i].id, tasksInNewColumn[i].columnId, (i + 2) * 100);
            }
            newPosition = (newPosition + 1) * 100;
        }
        return this.taskRepository.updatePosition(taskId, data.columnId, newPosition);
    }
    async deleteTask(taskId, userId, permanent = false) {
        const task = await this.taskRepository.findById(taskId);
        if (!task) {
            throw new error_1.NotFoundError('Task');
        }
        const userRole = await this.checkBoardAccess(task.boardId, userId);
        if (!task_permissions_1.TaskPermissions.canDeleteTask(userRole, task.reporterId, userId)) {
            throw new error_1.ForbiddenError('You do not have permission to delete this task');
        }
        if (permanent) {
            await this.taskRepository.hardDelete(taskId);
        }
        else {
            await this.taskRepository.softDelete(taskId);
        }
    }
    async getUserTasks(userId) {
        return this.taskRepository.findAllByAssignee(userId);
    }
    async reorderTasks(columnId, userId, taskIds) {
        const column = await prisma_1.prisma.column.findUnique({
            where: { id: columnId },
            select: { boardId: true },
        });
        if (!column) {
            throw new error_1.NotFoundError('Column');
        }
        const userRole = await this.checkBoardAccess(column.boardId, userId);
        if (userRole !== prisma_2.Role.ADMIN) {
            throw new error_1.ForbiddenError('You do not have permission to reorder tasks');
        }
        await this.taskRepository.reorderTasks(columnId, taskIds);
    }
}
exports.TaskService = TaskService;
