"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const logger_1 = __importDefault(require("./lib/logger"));
const socket_1 = require("./config/socket");
const PORT = env_1.env.PORT;
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
        const server = app_1.default.listen(PORT, () => {
            logger_1.default.info(`🚀 Server running on http://localhost:${PORT}`);
            logger_1.default.info(`📝 Environment: ${env_1.env.NODE_ENV}`);
            logger_1.default.info(`🔗 Frontend URL: ${env_1.env.FRONTEND_URL}`);
            logger_1.default.info(`🔌 WebSocket server ready on /socket.io`);
        });
        // Initialize Socket.IO
        (0, socket_1.initializeSocket)(server);
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
