"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToUser = exports.emitToTask = exports.emitToBoard = exports.emitToWorkspace = exports.initializeSocket = exports.connectedUsers = exports.io = void 0;
const socket_io_1 = require("socket.io");
const env_1 = require("./env");
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../lib/prisma");
const logger_1 = __importDefault(require("../lib/logger"));
exports.connectedUsers = new Map();
const initializeSocket = (server) => {
    ``;
    exports.io = new socket_io_1.Server(server, {
        cors: {
            origin: env_1.env.FRONTEND_URL,
            credentials: true,
            methods: ['GET', 'POST'],
        },
        path: '/socket.io',
    });
    exports.io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const payload = (0, jwt_1.verifyAccessToken)(token);
            socket.data.userId = payload.userId;
            socket.data.email = payload.email;
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    });
    exports.io.on('connection', (socket) => {
        logger_1.default.info(`User connected: ${socket.data.userId} (${socket.id})`);
        // Store connection
        exports.connectedUsers.set(socket.id, {
            socketId: socket.id,
            userId: socket.data.userId,
        });
        // Handle joining workspace rooms
        socket.on('join:workspace', async (workspaceId) => {
            const member = await prisma_1.prisma.workspaceMember.findUnique({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId: socket.data.userId,
                    },
                },
            });
            if (member) {
                socket.join(`workspace:${workspaceId}`);
                exports.connectedUsers.set(socket.id, {
                    socketId: socket.id,
                    userId: socket.data.userId,
                    workspaceId,
                });
                // Notify others in workspace
                socket.to(`workspace:${workspaceId}`).emit('user:online', {
                    userId: socket.data.userId,
                    socketId: socket.id,
                });
                logger_1.default.info(`User ${socket.data.userId} joined workspace:${workspaceId}`);
            }
        });
        // Handle joining board rooms
        socket.on('join:board', async (boardId) => {
            const board = await prisma_1.prisma.board.findUnique({
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
                logger_1.default.info(`User ${socket.data.userId} joined board:${boardId}`);
            }
        });
        // Handle joining task rooms
        socket.on('join:task', (taskId) => {
            socket.join(`task:${taskId}`);
            logger_1.default.info(`User ${socket.data.userId} joined task:${taskId}`);
        });
        // Handle leaving rooms
        socket.on('leave:workspace', (workspaceId) => {
            socket.leave(`workspace:${workspaceId}`);
            exports.connectedUsers.set(socket.id, {
                socketId: socket.id,
                userId: socket.data.userId,
            });
        });
        socket.on('leave:board', (boardId) => {
            socket.leave(`board:${boardId}`);
        });
        socket.on('leave:task', (taskId) => {
            socket.leave(`task:${taskId}`);
        });
        // Handle typing indicators
        socket.on('typing:start', (data) => {
            socket.to(`task:${data.taskId}`).emit('user:typing', {
                userId: data.userId,
                name: data.name,
                isTyping: true,
            });
        });
        socket.on('typing:stop', (data) => {
            socket.to(`task:${data.taskId}`).emit('user:typing', {
                userId: data.userId,
                isTyping: false,
            });
        });
        // Handle realtime task/comment updates
        // NOTE: mutations are handled in backend/src/sockets/handlers/* (canonical system).
        // This legacy mirror block is intentionally disabled to prevent duplicate listeners and event drift.
        // Handle notifications
        socket.on('notification:read', (data) => {
            // Update in database is handled by REST API
            // This just notifies other sessions
            socket.broadcast.emit('notification:read', data);
        });
        // Handle presence
        socket.on('presence:get', () => {
            const usersInWorkspace = Array.from(exports.connectedUsers.values())
                .filter(u => u.workspaceId === exports.connectedUsers.get(socket.id)?.workspaceId)
                .map(u => u.userId);
            socket.emit('presence:list', usersInWorkspace);
        });
        // Handle disconnection
        socket.on('disconnect', () => {
            const user = exports.connectedUsers.get(socket.id);
            if (user && user.workspaceId) {
                socket.to(`workspace:${user.workspaceId}`).emit('user:offline', {
                    userId: user.userId,
                });
            }
            exports.connectedUsers.delete(socket.id);
            logger_1.default.info(`User disconnected: ${socket.data.userId} (${socket.id})`);
        });
    });
    return exports.io;
};
exports.initializeSocket = initializeSocket;
const emitToWorkspace = (workspaceId, event, data) => {
    exports.io.to(`workspace:${workspaceId}`).emit(event, data);
};
exports.emitToWorkspace = emitToWorkspace;
const emitToBoard = (boardId, event, data) => {
    exports.io.to(`board:${boardId}`).emit(event, data);
};
exports.emitToBoard = emitToBoard;
const emitToTask = (taskId, event, data) => {
    exports.io.to(`task:${taskId}`).emit(event, data);
};
exports.emitToTask = emitToTask;
const emitToUser = (userId, event, data) => {
    const userSockets = Array.from(exports.connectedUsers.values())
        .filter(u => u.userId === userId)
        .map(u => u.socketId);
    userSockets.forEach(socketId => {
        exports.io.to(socketId).emit(event, data);
    });
};
exports.emitToUser = emitToUser;
