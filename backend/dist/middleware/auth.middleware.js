"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const error_1 = require("../utils/error");
const authMiddleware = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new error_1.UnauthorizedError('No token provided');
        }
        const token = authHeader.split(' ')[1];
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = {
            userId: payload.userId,
            email: payload.email,
        };
        next();
    }
    catch (error) {
        next(new error_1.UnauthorizedError('Invalid or expired token'));
    }
};
exports.authMiddleware = authMiddleware;
// Socket.io middleware version
const socketAuthMiddleware = (token) => {
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        return { userId: payload.userId, email: payload.email };
    }
    catch (error) {
        return null;
    }
};
exports.socketAuthMiddleware = socketAuthMiddleware;
