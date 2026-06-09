"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const task_handler_1 = require("./handlers/task.handler");
const comment_handler_1 = require("./handlers/comment.handler");
const typing_handler_1 = require("./handlers/typing.handler");
const presence_handler_1 = require("./handlers/presence.handler");
const jwt_1 = require("../utils/jwt");
const logger_1 = __importDefault(require("../lib/logger"));
const setupSocketHandlers = (io) => {
    io.use(async (socket, next) => {
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
    io.on('connection', (socket) => {
        logger_1.default.info(`Socket connected: ${socket.id} for user ${socket.data.userId}`);
        // Register all handlers
        (0, task_handler_1.registerTaskHandlers)(socket);
        (0, comment_handler_1.registerCommentHandlers)(socket);
        (0, typing_handler_1.registerTypingHandlers)(socket);
        (0, presence_handler_1.registerPresenceHandlers)(socket);
        // Room joining
        socket.on('join:workspace', (workspaceId) => {
            socket.join(`workspace:${workspaceId}`);
            socket.data.workspaceId = workspaceId;
            logger_1.default.info(`User ${socket.data.userId} joined workspace:${workspaceId}`);
        });
        socket.on('join:board', (boardId) => {
            socket.join(`board:${boardId}`);
            logger_1.default.info(`User ${socket.data.userId} joined board:${boardId}`);
        });
        socket.on('join:task', (taskId) => {
            socket.join(`task:${taskId}`);
            logger_1.default.info(`User ${socket.data.userId} joined task:${taskId}`);
        });
        socket.on('leave:workspace', (workspaceId) => {
            socket.leave(`workspace:${workspaceId}`);
        });
        socket.on('leave:board', (boardId) => {
            socket.leave(`board:${boardId}`);
        });
        socket.on('leave:task', (taskId) => {
            socket.leave(`task:${taskId}`);
        });
        socket.on('disconnect', () => {
            logger_1.default.info(`Socket disconnected: ${socket.id}`);
        });
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
