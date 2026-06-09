"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTypingHandlers = void 0;
const registerTypingHandlers = (socket) => {
    socket.on('typing:start', (data) => {
        socket.to(`task:${data.taskId}`).emit('user:typing', {
            userId: data.userId,
            userName: data.userName,
            isTyping: true,
        });
    });
    socket.on('typing:stop', (data) => {
        socket.to(`task:${data.taskId}`).emit('user:typing', {
            userId: data.userId,
            isTyping: false,
        });
    });
};
exports.registerTypingHandlers = registerTypingHandlers;
