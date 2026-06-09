import { Socket } from 'socket.io';
import { prisma } from '../../lib/prisma';

export const registerTaskHandlers = (socket: Socket) => {
  socket.on('task:create', async (data) => {
    try {
      const { boardId, columnId, title, priority, userId } = data;
      
      const task = await prisma.task.create({
        data: {
          boardId,
          columnId,
          title,
          priority,
          reporterId: userId,
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
      socket.emit('task:create:success', task);
    } catch (error) {
      socket.emit('task:create:error', { message: 'Failed to create task' });
    }
  });

  socket.on('task:move', async (data) => {
    try {
      const { taskId, columnId, position, boardId } = data;
      
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
      
      socket.emit('task:move:success', task);
    } catch (error) {
      socket.emit('task:move:error', { message: 'Failed to move task' });
    }
  });

  socket.on('task:update', async (data) => {
    try {
      const { taskId, boardId, ...updates } = data;
      
      const task = await prisma.task.update({
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
      socket.emit('task:update:success', task);
    } catch (error) {
      socket.emit('task:update:error', { message: 'Failed to update task' });
    }
  });
};