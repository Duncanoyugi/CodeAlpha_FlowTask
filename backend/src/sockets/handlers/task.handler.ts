import { Socket } from 'socket.io';
import { prisma } from '../../lib/prisma';
import { Role } from '../../generated/prisma';
import { SocketForbiddenError } from '../errors/socket-authz';
import { TaskPermissions } from '../../modules/tasks/task.permissions';
import {
  resolveBoardAccess,
  resolveTaskAccess,
} from '../../permissions/access-resolver';
import { ForbiddenError } from '../../utils/error';
import { TaskLifecycleService } from '../../modules/tasks/task.lifecycle.service';

const taskLifecycleService = new TaskLifecycleService();


export const registerTaskHandlers = (socket: Socket) => {
  socket.on('task:created', async (data) => {
    try {
      const { boardId, columnId, title, priority } = data;
      const currentUserId = socket.data.userId as string;

      const access = await resolveBoardAccess(boardId, currentUserId);
      if (!TaskPermissions.canCreateTask(access.permissionRole)) {
        throw new SocketForbiddenError('You do not have permission to create tasks');
      }

      const task = await prisma.task.create({
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
    } catch (error) {
      const message = error instanceof SocketForbiddenError
        ? error.message
        : 'Failed to create task';
      socket.emit('task:created', { error: 'Forbidden', message });
    }
  });

  socket.on('task:moved', async (data) => {
    try {
      const { taskId, columnId, position, boardId } = data;
      const currentUserId = socket.data.userId as string;
      const access = await resolveTaskAccess(taskId, currentUserId);

      if (!TaskPermissions.canMoveTask(
        access.permissionRole,
        access.reporterId,
        access.assigneeId,
        currentUserId,
      )) {
        throw new SocketForbiddenError('You do not have permission to move tasks');
      }

      const task = await prisma.task.update({
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
    } catch (error) {
      const message = error instanceof SocketForbiddenError || error instanceof ForbiddenError
        ? (error as Error).message
        : 'Failed to move task';
      socket.emit('task:moved', { error: 'Forbidden', message });
    }
  });

  socket.on('task:updated', async (data) => {
    try {
      const { taskId, boardId, ...updates } = data;
      const currentUserId = socket.data.userId as string;


      const access = await resolveTaskAccess(taskId, currentUserId);

      if (!TaskPermissions.canUpdateTask(
        access.permissionRole,
        access.reporterId,
        access.assigneeId,
        currentUserId,
      )) {
        throw new SocketForbiddenError('You do not have permission to update tasks');
      }

      if (boardId && boardId !== access.boardId) {
        throw new SocketForbiddenError('Task does not belong to the specified board');
      }

      // Enforce lifecycle rules for status transitions.
      // If client updates include status, route through TaskLifecycleService.
      const maybeStatus = (updates as any).status as string | undefined;

      const task = maybeStatus
        ? await taskLifecycleService.changeStatus(taskId, maybeStatus, currentUserId)
        : await prisma.task.update({
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
    } catch (error) {
      const message = error instanceof SocketForbiddenError || error instanceof ForbiddenError
        ? (error as Error).message
        : 'Failed to update task';
      socket.emit('task:updated', { error: 'Forbidden', message });
    }
  });
};
