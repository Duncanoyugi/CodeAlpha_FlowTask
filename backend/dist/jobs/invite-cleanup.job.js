"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredInvites = void 0;
const prisma_1 = require("../lib/prisma");
const logger_1 = __importDefault(require("../lib/logger"));
const cleanupExpiredInvites = async () => {
    try {
        const result = await prisma_1.prisma.invite.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
                acceptedAt: null,
            },
        });
        if (result.count > 0) {
            logger_1.default.info(`Cleaned up ${result.count} expired invites`);
        }
    }
    catch (error) {
        logger_1.default.error('Invite cleanup error:', error);
    }
};
exports.cleanupExpiredInvites = cleanupExpiredInvites;
