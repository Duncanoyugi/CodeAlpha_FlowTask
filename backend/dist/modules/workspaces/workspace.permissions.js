"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacePermissions = void 0;
const roles_1 = require("../../constants/roles");
class WorkspacePermissions {
    static canUpdateWorkspace(userRole, userId, ownerId) {
        return (0, roles_1.canManageWorkspaceResources)(userRole, userId, ownerId);
    }
    static canDeleteWorkspace(userId, ownerId) {
        return (0, roles_1.isWorkspaceOwner)(userId, ownerId);
    }
    static canManageBilling(userId, ownerId) {
        return (0, roles_1.isWorkspaceOwner)(userId, ownerId);
    }
    static canTransferOwnership(userId, ownerId) {
        return (0, roles_1.isWorkspaceOwner)(userId, ownerId);
    }
    static canInviteMembers(userRole) {
        return (0, roles_1.canManageWorkspaceMembers)(userRole);
    }
    static canRemoveMember(currentRole, currentUserId, targetUserId, ownerId) {
        if ((0, roles_1.isWorkspaceOwner)(currentUserId, ownerId)) {
            return targetUserId !== ownerId;
        }
        return (0, roles_1.canManageWorkspaceMembers)(currentRole) && targetUserId !== ownerId;
    }
    static canChangeRole(currentRole, currentUserId, targetUserId, ownerId) {
        if ((0, roles_1.isWorkspaceOwner)(currentUserId, ownerId)) {
            return targetUserId !== ownerId;
        }
        return (0, roles_1.canManageWorkspaceMembers)(currentRole) && targetUserId !== ownerId;
    }
}
exports.WorkspacePermissions = WorkspacePermissions;
