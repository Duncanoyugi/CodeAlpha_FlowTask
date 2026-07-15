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
    boardMoveLocks.set(boardId, current);
    try {
        await prev;
        return await fn();
    }
    finally {
        release();
        if (boardMoveLocks.get(boardId) === current) {
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
            await prisma_1.prisma.$transaction(async (tx) => {
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
            const tasksInColumn = await tx.task.findMany({
                where: { columnId, deletedAt: null },
                select: { id: true },
                orderBy: { position: 'asc' },
            });
            const taskIdSet = new Set(tasksInColumn.map((task) => task.id));
            if (taskIds.length !== tasksInColumn.length || taskIds.some((id) => !taskIdSet.has(id))) {
                throw new error_1.BadRequestError('Invalid task reorder payload');
            }
            await Promise.all(taskIds.map((orderedTaskId, idx) => tx.task.update({
                where: { id: orderedTaskId },
                data: { position: (idx + 1) * 100 },
            })));
        }, {
            timeout: 20_000,
            maxWait: 20_000,
        });
    }
}
exports.TaskService = TaskService;
