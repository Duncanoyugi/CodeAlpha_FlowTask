import { Role } from '../../generated/prisma';
import { canManageWorkspaceMembers, canManageWorkspaceResources, isWorkspaceOwner } from '../../constants/roles';

export class WorkspacePermissions {
  static canUpdateWorkspace(userRole: Role, userId: string, ownerId: string): boolean {
    return canManageWorkspaceResources(userRole, userId, ownerId);
  }

  static canDeleteWorkspace(userId: string, ownerId: string): boolean {
    return isWorkspaceOwner(userId, ownerId);
  }

  static canManageBilling(userId: string, ownerId: string): boolean {
    return isWorkspaceOwner(userId, ownerId);
  }

  static canTransferOwnership(userId: string, ownerId: string): boolean {
    return isWorkspaceOwner(userId, ownerId);
  }

  static canInviteMembers(userRole: Role): boolean {
    return canManageWorkspaceMembers(userRole);
  }

  static canRemoveMember(
    currentRole: Role,
    currentUserId: string,
    targetUserId: string,
    ownerId: string,
  ): boolean {
    if (isWorkspaceOwner(currentUserId, ownerId)) {
      return targetUserId !== ownerId;
    }

    return canManageWorkspaceMembers(currentRole) && targetUserId !== ownerId;
  }

  static canChangeRole(
    currentRole: Role,
    currentUserId: string,
    targetUserId: string,
    ownerId: string,
  ): boolean {
    if (isWorkspaceOwner(currentUserId, ownerId)) {
      return targetUserId !== ownerId;
    }

    return canManageWorkspaceMembers(currentRole) && targetUserId !== ownerId;
  }
}
