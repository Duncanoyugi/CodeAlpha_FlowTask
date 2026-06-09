"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommentHandlers = void 0;
const prisma_1 = require("../../lib/prisma");
const registerCommentHandlers = (socket) => {
    socket.on('comment:add', async (data) => {
        try {
            const { taskId, content, userId, boardId } = data;
            const comment = await prisma_1.prisma.comment.create({
                data: {
                    taskId,
                    authorId: userId,
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
            socket.emit('comment:add:success', comment);
        }
        catch (error) {
            socket.emit('comment:add:error', { message: 'Failed to add comment' });
        }
    });
    socket.on('comment:edit', async (data) => {
        try {
            const { commentId, content, taskId } = data;
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
            socket.emit('comment:edit:success', comment);
        }
        catch (error) {
            socket.emit('comment:edit:error', { message: 'Failed to edit comment' });
        }
    });
    socket.on('comment:delete', async (data) => {
        try {
            const { commentId, taskId } = data;
            await prisma_1.prisma.comment.delete({
                where: { id: commentId },
            });
            socket.to(`task:${taskId}`).emit('comment:deleted', { commentId, taskId });
            socket.emit('comment:delete:success', { commentId });
        }
        catch (error) {
            socket.emit('comment:delete:error', { message: 'Failed to delete comment' });
        }
    });
};
exports.registerCommentHandlers = registerCommentHandlers;
