"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceAccessMiddleware = void 0;
const error_1 = require("../utils/error");
const access_resolver_1 = require("../permissions/access-resolver");
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
        const access = await (0, access_resolver_1.resolveWorkspaceAccess)(workspaceId, userId);
        req.userRole = access.permissionRole;
        req.effectiveRole = access.effectiveRole;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.workspaceAccessMiddleware = workspaceAccessMiddleware;
