import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { registerTaskHandlers } from './handlers/task.handler';
import { registerCommentHandlers } from './handlers/comment.handler';
import { registerTypingHandlers } from './handlers/typing.handler';
import { registerPresenceHandlers } from './handlers/presence.handler';
import { verifyAccessToken } from '../utils/jwt';
import logger from '../lib/logger';

export const setupSocketHandlers = (io: SocketServer) => {
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

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} for user ${socket.data.userId}`);

    // Register all handlers
    registerTaskHandlers(socket);
    registerCommentHandlers(socket);
    registerTypingHandlers(socket);
    registerPresenceHandlers(socket);

    // Room joining
    socket.on('join:workspace', (workspaceId: string) => {
      socket.join(`workspace:${workspaceId}`);
      socket.data.workspaceId = workspaceId;
      logger.info(`User ${socket.data.userId} joined workspace:${workspaceId}`);
    });

    socket.on('join:board', (boardId: string) => {
      socket.join(`board:${boardId}`);
      logger.info(`User ${socket.data.userId} joined board:${boardId}`);
    });

    socket.on('join:task', (taskId: string) => {
      socket.join(`task:${taskId}`);
      logger.info(`User ${socket.data.userId} joined task:${taskId}`);
    });

    socket.on('leave:workspace', (workspaceId: string) => {
      socket.leave(`workspace:${workspaceId}`);
    });

    socket.on('leave:board', (boardId: string) => {
      socket.leave(`board:${boardId}`);
    });

    socket.on('leave:task', (taskId: string) => {
      socket.leave(`task:${taskId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};