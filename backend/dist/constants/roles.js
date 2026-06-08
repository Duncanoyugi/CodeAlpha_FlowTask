"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWorkspaceOwner = exports.hasHigherOrEqualRole = exports.RolePermissions = exports.RoleHierarchy = void 0;
const prisma_1 = require("../generated/prisma");
exports.RoleHierarchy = {
    [prisma_1.Role.ADMIN]: 3,
    [prisma_1.Role.MEMBER]: 2,
    [prisma_1.Role.VIEWER]: 1,
};
exports.RolePermissions = {
    [prisma_1.Role.ADMIN]: {
        canDeleteWorkspace: false, // Only owner can
        canManageBilling: false, // Only owner can
        canInviteMembers: true,
        canRemoveMembers: true,
        canChangeRoles: true,
        canCreateProject: true,
        canDeleteProject: true,
        canCreateBoard: true,
        canDeleteBoard: true,
        canManageAllTasks: true,
        canViewAnalytics: true,
    },
    [prisma_1.Role.MEMBER]: {
        canInviteMembers: false,
        canRemoveMembers: false,
        canChangeRoles: false,
        canCreateProject: false,
        canDeleteProject: false,
        canCreateBoard: false,
        canDeleteBoard: false,
        canManageAllTasks: false,
        canManageOwnTasks: true,
        canComment: true,
        canUploadAttachments: true,
        canViewAnalytics: false,
    },
    [prisma_1.Role.VIEWER]: {
        canViewProjects: true,
        canViewTasks: true,
        canComment: true,
        canEditAnything: false,
    },
};
const hasHigherOrEqualRole = (userRole, requiredRole) => {
    return exports.RoleHierarchy[userRole] >= exports.RoleHierarchy[requiredRole];
};
exports.hasHigherOrEqualRole = hasHigherOrEqualRole;
const isWorkspaceOwner = (userId, workspaceOwnerId) => {
    return userId === workspaceOwnerId;
};
exports.isWorkspaceOwner = isWorkspaceOwner;
