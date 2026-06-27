"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommentHandlers = void 0;
const prisma_1 = require("../../lib/prisma");
const prisma_2 = require("../../generated/prisma");
const socket_authz_1 = require("../errors/socket-authz");
const access_resolver_1 = require("../../permissions/access-resolver");
const error_1 = require("../../utils/error");
const registerCommentHandlers = (socket) => {
    socket.on('comment:added', async (data) => {
        try {
            const { taskId, content, boardId } = data;
            const currentUserId = socket.data.userId;
            const access = await (0, access_resolver_1.resolveTaskAccess)(taskId, currentUserId);
            if (access.permissionRole === prisma_2.Role.VIEWER) {
                throw new socket_authz_1.SocketForbiddenError('You do not have permission to add comments');
            }
            const comment = await prisma_1.prisma.comment.create({
                data: {
                    taskId,
                    authorId: currentUserId,
                    content,
                },
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
            });
            socket.to(`task:${taskId}`).emit('comment:added', comment);
            socket.to(`board:${boardId}`).emit('activity:updated', {
                type: 'comment',
                taskId,
                comment,
            });
            socket.emit('comment:added', comment);
        }
        catch (error) {
            const message = error instanceof socket_authz_1.SocketForbiddenError || error instanceof error_1.ForbiddenError
                ? error.message
                : 'Failed to add comment';
            socket.emit('comment:error', { message });
        }
    });
    socket.on('comment:updated', async (data) => {
        try {
            const { commentId, content, taskId } = data;
            const currentUserId = socket.data.userId;
            const access = await (0, access_resolver_1.resolveTaskAccess)(taskId, currentUserId);
            if (access.permissionRole === prisma_2.Role.VIEWER) {
                throw new socket_authz_1.SocketForbiddenError('You do not have permission to edit comments');
            }
            const existing = await prisma_1.prisma.comment.findUnique({
                where: { id: commentId },
                select: { authorId: true },
            });
            if (!existing) {
                throw new socket_authz_1.SocketForbiddenError('Comment not found');
            }
            if (existing.authorId !== currentUserId && access.permissionRole !== prisma_2.Role.ADMIN) {
                throw new socket_authz_1.SocketForbiddenError('You do not have permission to edit this comment');
            }
            const comment = await prisma_1.prisma.comment.update({
                where: { id: commentId },
                data: {
                    content,
                    editedAt: new Date(),
                },
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
            });
            socket.to(`task:${taskId}`).emit('comment:updated', comment);
            socket.emit('comment:updated', comment);
        }
        catch (error) {
            const message = error instanceof socket_authz_1.SocketForbiddenError || error instanceof error_1.ForbiddenError
                ? error.message
                : 'Failed to edit comment';
            socket.emit('comment:error', { message });
        }
    });
    socket.on('comment:delete', async (data) => {
        try {
            const { commentId, taskId } = data;
            const currentUserId = socket.data.userId;
            const access = await (0, access_resolver_1.resolveTaskAccess)(taskId, currentUserId);
            if (access.permissionRole === prisma_2.Role.VIEWER) {
                throw new socket_authz_1.SocketForbiddenError('You do not have permission to delete comments');
            }
            const existing = await prisma_1.prisma.comment.findUnique({
                where: { id: commentId },
                select: { authorId: true },
            });
            if (!existing) {
                throw new socket_authz_1.SocketForbiddenError('Comment not found');
            }
            if (existing.authorId !== currentUserId && access.permissionRole !== prisma_2.Role.ADMIN) {
                throw new socket_authz_1.SocketForbiddenError('You do not have permission to delete this comment');
            }
            await prisma_1.prisma.comment.delete({
                where: { id: commentId },
            });
            socket.to(`task:${taskId}`).emit('comment:deleted', { commentId, taskId });
            socket.emit('comment:deleted', { commentId, taskId });
        }
        catch (error) {
            const message = error instanceof socket_authz_1.SocketForbiddenError || error instanceof error_1.ForbiddenError
                ? error.message
                : 'Failed to delete comment';
            socket.emit('comment:error', { message });
        }
    });
};
exports.registerCommentHandlers = registerCommentHandlers;
