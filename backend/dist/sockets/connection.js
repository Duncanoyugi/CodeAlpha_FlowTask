"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketIO = void 0;
const socket_1 = require("../config/socket");
const setupSocketIO = (server) => {
    const io = (0, socket_1.initializeSocket)(server);
    return io;
};
exports.setupSocketIO = setupSocketIO;
