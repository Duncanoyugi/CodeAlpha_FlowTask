"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const task_repository_1 = require("./task.repository");
const error_1 = require("../../../src/utils/error");
const prisma_1 = require("../../../src/lib/prisma");
const prisma_2 = require("../../generated/prisma");
const task_permissions_1 = require("./task.permissions");
const access_resolver_1 = require("../../../src/permissions/access-resolver");
const boardMoveLocks = new Map();
async function withBoardMoveLock(boardId, fn) {
    const prev = boardMoveLocks.get(boardId) ?? Promise.resolve();
    let release;
    const current = new Promise((resolve) => {
        release = resolve;
    });
    boardMoveLocks.set(boardId, prev.finally(() => current));
    try {
        await prev;
        return await fn();
    }
    finally {
        release();
        if (boardMoveLocks.get(boardId) === prev.finally(() => current)) {
            boardMoveLocks.delete(boardId);
        }
    }
}
class TaskService {
    taskRepository;
    constructor() {
        this.taskRepository = new task_repository_1.TaskRepository();
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
        const workspaceAccess = await (0, access_resolver_1.resolveBoardAccess)(boardId, userId);
        if (!task_permissions_1.TaskPermissions.canCreateTask(workspaceAccess.permissionRole)) {
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
        await (0, access_resolver_1.resolveBoardAccess)(task.boardId, userId);
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
        await (0, access_resolver_1.resolveBoardAccess)(column.boardId, userId);
        return this.taskRepository.findAllByColumn(columnId);
    }
    async getBoardTasks(boardId, userId) {
        await (0, access_resolver_1.resolveBoardAccess)(boardId, userId);
        return this.taskRepository.findAllByBoard(boardId);
    }
    async updateTask(taskId, userId, data) {
        const access = await (0, access_resolver_1.resolveTaskAccess)(taskId, userId);
        if (!task_permissions_1.TaskPermissions.canUpdateTask(access.permissionRole, access.reporterId, access.assigneeId, userId)) {
            throw new error_1.ForbiddenError('You do not have permission to update this task');
        }
        return this.taskRepository.update(taskId, data);
    }
    async moveTask(taskId, userId, data) {
        const access = await (0, access_resolver_1.resolveTaskAccess)(taskId, userId);
        if (!task_permissions_1.TaskPermissions.canMoveTask(access.permissionRole, access.reporterId, access.assigneeId, userId)) {
            throw new error_1.ForbiddenError('You do not have permission to move this task');
        }
        await this.checkColumnExists(data.columnId);
        const targetColumn = await prisma_1.prisma.column.findUnique({
            where: { id: data.columnId },
            select: { boardId: true },
        });
        if (!targetColumn || targetColumn.boardId !== access.boardId) {
            throw new error_1.ForbiddenError('Cannot move task to a column outside its board');
        }
        return withBoardMoveLock(access.boardId, async () => {
            return prisma_1.prisma.$transaction(async (tx) => {
                const tasksInNewColumn = await tx.task.findMany({
                    where: { columnId: data.columnId, deletedAt: null },
                    select: { id: true },
                    orderBy: { position: 'asc' },
                });
                let newPosition = data.position;
                if (newPosition >= tasksInNewColumn.length) {
                    newPosition = tasksInNewColumn.length * 100 + 100;
                }
                else {
                    const toShift = tasksInNewColumn.slice(newPosition);
                    await Promise.all(toShift.map((t, idx) => tx.task.update({
                        where: { id: t.id },
                        data: {
                            columnId: data.columnId,
                            position: (newPosition + idx + 2) * 100,
                        },
                    })));
                    newPosition = (newPosition + 1) * 100;
                }
                return tx.task.update({
                    where: { id: taskId },
                    data: { columnId: data.columnId, position: newPosition },
                    include: {
                        reporter: {
                            select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
                        },
                        assignee: {
                            select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
                        },
                    },
                });
            });
        });
    }
    async deleteTask(taskId, userId, permanent = false) {
        const access = await (0, access_resolver_1.resolveTaskAccess)(taskId, userId);
        if (!task_permissions_1.TaskPermissions.canDeleteTask(access.permissionRole, access.reporterId, userId)) {
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
        const workspaceAccess = await (0, access_resolver_1.resolveBoardAccess)(column.boardId, userId);
        const tasks = await this.taskRepository.findAllByColumn(columnId);
        if (!task_permissions_1.TaskPermissions.canReorderTasks(workspaceAccess.permissionRole, tasks, userId)) {
            throw new error_1.ForbiddenError('You do not have permission to reorder tasks');
        }
        await prisma_1.prisma.$transaction(async (tx) => {
            await Promise.all(taskIds.map((taskId, idx) => tx.task.update({
                where: { id: taskId },
                data: { position: (idx + 1) * 100 },
            })));
        });
    }
}
exports.TaskService = TaskService;
