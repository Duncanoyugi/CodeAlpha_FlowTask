import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { env } from './env';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

export let io: SocketServer;

export interface SocketUser {
  socketId: string;
  userId: string;
  workspaceId?: string;
}

export const connectedUsers = new Map<string, SocketUser>();

export const initializeSocket = (server: HttpServer) => {
  io = new SocketServer(server, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      socket.data.email = payload.email;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`User connected: ${socket.data.userId} (${socket.id})`);

    // Store connection
    connectedUsers.set(socket.id, {
      socketId: socket.id,
      userId: socket.data.userId,
    });

    // Handle joining workspace rooms
    socket.on('join:workspace', async (workspaceId: string) => {
      const member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: socket.data.userId,
          },
        },
      });

      if (member) {
        socket.join(`workspace:${workspaceId}`);
        connectedUsers.set(socket.id, {
          socketId: socket.id,
          userId: socket.data.userId,
          workspaceId,
        });
        
        // Notify others in workspace
        socket.to(`workspace:${workspaceId}`).emit('user:online', {
          userId: socket.data.userId,
          socketId: socket.id,
        });
        
        logger.info(`User ${socket.data.userId} joined workspace:${workspaceId}`);
      }
    });

    // Handle joining board rooms
    socket.on('join:board', async (boardId: string) => {
      const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: {
          project: {
            include: {
              workspace: {
                include: {
                  members: {
                    where: { userId: socket.data.userId },
                  },
                },
              },
            },
          },
        },
      });

      if (board && board.project.workspace.members.length > 0) {
        socket.join(`board:${boardId}`);
        logger.info(`User ${socket.data.userId} joined board:${boardId}`);
      }
    });

    // Handle joining task rooms
    socket.on('join:task', (taskId: string) => {
      socket.join(`task:${taskId}`);
      logger.info(`User ${socket.data.userId} joined task:${taskId}`);
    });

    // Handle leaving rooms
    socket.on('leave:workspace', (workspaceId: string) => {
      socket.leave(`workspace:${workspaceId}`);
      connectedUsers.set(socket.id, {
        socketId: socket.id,
        userId: socket.data.userId,
      });
    });

    socket.on('leave:board', (boardId: string) => {
      socket.leave(`board:${boardId}`);
    });

    socket.on('leave:task', (taskId: string) => {
      socket.leave(`task:${taskId}`);
    });

    // Handle typing indicators
    socket.on('typing:start', (data: { taskId: string; userId: string; name: string }) => {
      socket.to(`task:${data.taskId}`).emit('user:typing', {
        userId: data.userId,
        name: data.name,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (data: { taskId: string; userId: string }) => {
      socket.to(`task:${data.taskId}`).emit('user:typing', {
        userId: data.userId,
        isTyping: false,
      });
    });

    // Handle realtime task updates
    socket.on('task:created', (taskData) => {
      socket.to(`board:${taskData.boardId}`).emit('task:created', taskData);
    });

    socket.on('task:updated', (taskData) => {
      socket.to(`board:${taskData.boardId}`).emit('task:updated', taskData);
    });

    socket.on('task:moved', (moveData) => {
      socket.to(`board:${moveData.boardId}`).emit('task:moved', moveData);
    });

    socket.on('task:deleted', (data) => {
      socket.to(`board:${data.boardId}`).emit('task:deleted', data);
    });

    // Handle realtime comment updates
    socket.on('comment:added', (commentData) => {
      socket.to(`task:${commentData.taskId}`).emit('comment:added', commentData);
      
      // Also notify board for activity feed
      if (commentData.boardId) {
        socket.to(`board:${commentData.boardId}`).emit('activity:updated', {
          type: 'comment',
          taskId: commentData.taskId,
          comment: commentData,
        });
      }
    });

    socket.on('comment:updated', (commentData) => {
      socket.to(`task:${commentData.taskId}`).emit('comment:updated', commentData);
    });

    socket.on('comment:deleted', (data) => {
      socket.to(`task:${data.taskId}`).emit('comment:deleted', data);
    });

    // Handle notifications
    socket.on('notification:read', (data: { notificationId: string }) => {
      // Update in database is handled by REST API
      // This just notifies other sessions
      socket.broadcast.emit('notification:read', data);
    });

    // Handle presence
    socket.on('presence:get', () => {
      const usersInWorkspace = Array.from(connectedUsers.values())
        .filter(u => u.workspaceId === connectedUsers.get(socket.id)?.workspaceId)
        .map(u => u.userId);
      
      socket.emit('presence:list', usersInWorkspace);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user && user.workspaceId) {
        socket.to(`workspace:${user.workspaceId}`).emit('user:offline', {
          userId: user.userId,
        });
      }
      connectedUsers.delete(socket.id);
      logger.info(`User disconnected: ${socket.data.userId} (${socket.id})`);
    });
  });

  return io;
};

export const emitToWorkspace = (workspaceId: string, event: string, data: any) => {
  io.to(`workspace:${workspaceId}`).emit(event, data);
};

export const emitToBoard = (boardId: string, event: string, data: any) => {
  io.to(`board:${boardId}`).emit(event, data);
};

export const emitToTask = (taskId: string, event: string, data: any) => {
  io.to(`task:${taskId}`).emit(event, data);
};

export const emitToUser = (userId: string, event: string, data: any) => {
  const userSockets = Array.from(connectedUsers.values())
    .filter(u => u.userId === userId)
    .map(u => u.socketId);
  
  userSockets.forEach(socketId => {
    io.to(socketId).emit(event, data);
  });
};