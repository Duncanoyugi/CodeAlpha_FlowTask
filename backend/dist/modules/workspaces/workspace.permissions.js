"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacePermissions = void 0;
const prisma_1 = require("../../generated/prisma");
class WorkspacePermissions {
    static canDeleteWorkspace(userId, ownerId) {
        return userId === ownerId;
    }
    static canManageMembers(userRole) {
        return userRole === prisma_1.Role.ADMIN || userRole === prisma_1.Role.MEMBER;
    }
    static canUpdateWorkspace(userRole) {
        return userRole === prisma_1.Role.ADMIN || userRole === prisma_1.Role.MEMBER;
    }
    static canInviteMembers(userRole) {
        return userRole === prisma_1.Role.ADMIN || userRole === prisma_1.Role.MEMBER;
    }
    static canRemoveMember(currentUserRole, targetUserRole, currentUserId, targetUserId, ownerId) {
        // Owner can remove anyone
        if (currentUserId === ownerId)
            return true;
        // Cannot remove self
        if (currentUserId === targetUserId)
            return false;
        // Admin can remove MEMBERS and VIEWERS, but not other ADMINS
        if (currentUserRole === prisma_1.Role.ADMIN) {
            return targetUserRole !== prisma_1.Role.ADMIN;
        }
        return false;
    }
    static canChangeRole(currentUserRole, targetUserRole, currentUserId, targetUserId, ownerId) {
        // Owner can change anyone's role
        if (currentUserId === ownerId)
            return true;
        // Cannot change own role
        if (currentUserId === targetUserId)
            return false;
        // Admin can change MEMBERS and VIEWERS to other roles except ADMIN
        if (currentUserRole === prisma_1.Role.ADMIN) {
            return targetUserRole !== prisma_1.Role.ADMIN;
        }
        return false;
    }
}
exports.WorkspacePermissions = WorkspacePermissions;
