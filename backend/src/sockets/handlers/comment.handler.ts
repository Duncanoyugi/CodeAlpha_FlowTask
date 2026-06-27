import { Socket } from 'socket.io';
import { prisma } from '../../lib/prisma';
import { Role } from '../../generated/prisma';
import { SocketForbiddenError } from '../errors/socket-authz';
import { resolveTaskAccess } from '../../permissions/access-resolver';
import { ForbiddenError } from '../../utils/error';

export const registerCommentHandlers = (socket: Socket) => {
  socket.on('comment:added', async (data) => {
    try {
      const { taskId, content, boardId } = data;
      const currentUserId = socket.data.userId as string;

      const access = await resolveTaskAccess(taskId, currentUserId);
      if (access.permissionRole === Role.VIEWER) {
        throw new SocketForbiddenError('You do not have permission to add comments');
      }

      const comment = await prisma.comment.create({
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
    } catch (error) {
      const message = error instanceof SocketForbiddenError || error instanceof ForbiddenError
        ? (error as Error).message
        : 'Failed to add comment';
      socket.emit('comment:error', { message });
    }
  });

  socket.on('comment:updated', async (data) => {
    try {
      const { commentId, content, taskId } = data;
      const currentUserId = socket.data.userId as string;

      const access = await resolveTaskAccess(taskId, currentUserId);
      if (access.permissionRole === Role.VIEWER) {
        throw new SocketForbiddenError('You do not have permission to edit comments');
      }

      const existing = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { authorId: true },
      });

      if (!existing) {
        throw new SocketForbiddenError('Comment not found');
      }

      if (existing.authorId !== currentUserId && access.permissionRole !== Role.ADMIN) {
        throw new SocketForbiddenError('You do not have permission to edit this comment');
      }

      const comment = await prisma.comment.update({
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
    } catch (error) {
      const message = error instanceof SocketForbiddenError || error instanceof ForbiddenError
        ? (error as Error).message
        : 'Failed to edit comment';
      socket.emit('comment:error', { message });
    }
  });

  socket.on('comment:delete', async (data) => {
    try {
      const { commentId, taskId } = data;
      const currentUserId = socket.data.userId as string;

      const access = await resolveTaskAccess(taskId, currentUserId);
      if (access.permissionRole === Role.VIEWER) {
        throw new SocketForbiddenError('You do not have permission to delete comments');
      }

      const existing = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { authorId: true },
      });

      if (!existing) {
        throw new SocketForbiddenError('Comment not found');
      }

      if (existing.authorId !== currentUserId && access.permissionRole !== Role.ADMIN) {
        throw new SocketForbiddenError('You do not have permission to delete this comment');
      }

      await prisma.comment.delete({
        where: { id: commentId },
      });

      socket.to(`task:${taskId}`).emit('comment:deleted', { commentId, taskId });
      socket.emit('comment:deleted', { commentId, taskId });
    } catch (error) {
      const message = error instanceof SocketForbiddenError || error instanceof ForbiddenError
        ? (error as Error).message
        : 'Failed to delete comment';
      socket.emit('comment:error', { message });
    }
  });
};
