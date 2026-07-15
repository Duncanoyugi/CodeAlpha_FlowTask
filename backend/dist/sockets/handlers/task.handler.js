"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTaskHandlers = void 0;
const prisma_1 = require("../../lib/prisma");
const socket_authz_1 = require("../errors/socket-authz");
const task_permissions_1 = require("../../modules/tasks/task.permissions");
const access_resolver_1 = require("../../permissions/access-resolver");
const error_1 = require("../../utils/error");
const task_lifecycle_service_1 = require("../../modules/tasks/task.lifecycle.service");
const taskLifecycleService = new task_lifecycle_service_1.TaskLifecycleService();
const registerTaskHandlers = (socket) => {
    socket.on('task:created', async (data) => {
        try {
            const { boardId, columnId, title, priority } = data;
            const currentUserId = socket.data.userId;
            const access = await (0, access_resolver_1.resolveBoardAccess)(boardId, currentUserId);
            if (!task_permissions_1.TaskPermissions.canCreateTask(access.permissionRole)) {
                throw new socket_authz_1.SocketForbiddenError('You do not have permission to create tasks');
            }
            const task = await prisma_1.prisma.task.create({
                data: {
                    boardId,
                    columnId,
                    title,
                    priority,
                    reporterId: currentUserId,
                    position: 0,
                },
                include: {
                    assignee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    reporter: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });
            socket.to(`board:${boardId}`).emit('task:created', task);
            socket.emit('task:created', task);
        }
        catch (error) {
            const message = error instanceof socket_authz_1.SocketForbiddenError
                ? error.message
                : 'Failed to create task';
            socket.emit('task:created', { error: 'Forbidden', message });
        }
    });
    socket.on('task:moved', async (data) => {
        try {
            const { taskId, columnId, position, boardId } = data;
            const currentUserId = socket.data.userId;
            const access = await (0, access_resolver_1.resolveTaskAccess)(taskId, currentUserId);
            if (!task_permissions_1.TaskPermissions.canMoveTask(access.permissionRole, access.reporterId, access.assigneeId, currentUserId)) {
                throw new socket_authz_1.SocketForbiddenError('You do not have permission to move tasks');
            }
            const task = await prisma_1.prisma.task.update({
                where: { id: taskId },
                data: {
                    columnId,
                    position,
                },
                include: {
                    assignee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });
            socket.to(`board:${boardId}`).emit('task:moved', {
                task,
                oldColumnId: data.oldColumnId,
                newColumnId: columnId,
            });
            socket.emit('task:moved', task);
        }
        catch (error) {
            const message = error instanceof socket_authz_1.SocketForbiddenError || error instanceof error_1.ForbiddenError
                ? error.message
                : 'Failed to move task';
            socket.emit('task:moved', { error: 'Forbidden', message });
        }
    });
    socket.on('task:updated', async (data) => {
        try {
            const { taskId, boardId, ...updates } = data;
            const currentUserId = socket.data.userId;
            const access = await (0, access_resolver_1.resolveTaskAccess)(taskId, currentUserId);
            if (!task_permissions_1.TaskPermissions.canUpdateTask(access.permissionRole, access.reporterId, access.assigneeId, currentUserId)) {
                throw new socket_authz_1.SocketForbiddenError('You do not have permission to update tasks');
            }
            if (boardId && boardId !== access.boardId) {
                throw new socket_authz_1.SocketForbiddenError('Task does not belong to the specified board');
            }
            // Enforce lifecycle rules for status transitions.
            // If client updates include status, route through TaskLifecycleService.
            const maybeStatus = updates.status;
            const task = maybeStatus
                ? await taskLifecycleService.changeStatus(taskId, maybeStatus, currentUserId)
                : await prisma_1.prisma.task.update({
                    where: { id: taskId },
                    data: updates,
                    include: {
                        assignee: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                });
            socket.to(`board:${boardId}`).emit('task:updated', task);
            socket.to(`task:${taskId}`).emit('task:updated', task);
            socket.emit('task:updated', task);
        }
        catch (error) {
            const message = error instanceof socket_authz_1.SocketForbiddenError || error instanceof error_1.ForbiddenError
                ? error.message
                : 'Failed to update task';
            socket.emit('task:updated', { error: 'Forbidden', message });
        }
    });
};
exports.registerTaskHandlers = registerTaskHandlers;
