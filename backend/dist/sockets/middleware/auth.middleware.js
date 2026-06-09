"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = void 0;
const jwt_1 = require("../../utils/jwt");
const socketAuthMiddleware = (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }
        const payload = (0, jwt_1.verifyAccessToken)(token);
        socket.data.userId = payload.userId;
        socket.data.email = payload.email;
        next();
    }
    catch (error) {
        next(new Error('Authentication error: Invalid token'));
    }
};
exports.socketAuthMiddleware = socketAuthMiddleware;
