"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceAccessMiddleware = void 0;
const prisma_1 = require("../lib/prisma");
const error_1 = require("../utils/error");
const workspaceAccessMiddleware = async (req, res, next) => {
    try {
        const workspaceId = req.params.workspaceId;
        const userId = req.user?.userId;
        if (!workspaceId) {
            return next();
        }
        if (!userId) {
            throw new error_1.ForbiddenError('Authentication required');
        }
        const member = await prisma_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
        });
        if (!member) {
            throw new error_1.ForbiddenError('You do not have access to this workspace');
        }
        req.userRole = member.role;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.workspaceAccessMiddleware = workspaceAccessMiddleware;
