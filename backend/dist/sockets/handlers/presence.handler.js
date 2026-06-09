"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPresenceHandlers = void 0;
const socket_1 = require("../../config/socket");
const registerPresenceHandlers = (socket) => {
    socket.on('presence:subscribe', (workspaceId) => {
        const usersInWorkspace = Array.from(socket_1.connectedUsers.values())
            .filter((u) => u.workspaceId === workspaceId)
            .map((u) => u.userId);
        socket.emit('presence:list', usersInWorkspace);
    });
    socket.on('presence:ping', () => {
        socket.emit('presence:pong');
    });
};
exports.registerPresenceHandlers = registerPresenceHandlers;
