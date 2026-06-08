import { Role } from '../../generated/prisma';

export class WorkspacePermissions {
  static canDeleteWorkspace(userId: string, ownerId: string): boolean {
    return userId === ownerId;
  }

  static canManageMembers(userRole: Role): boolean {
    return userRole === Role.ADMIN || userRole === Role.MEMBER;
  }

  static canUpdateWorkspace(userRole: Role): boolean {
    return userRole === Role.ADMIN || userRole === Role.MEMBER;
  }

  static canInviteMembers(userRole: Role): boolean {
    return userRole === Role.ADMIN || userRole === Role.MEMBER;
  }

  static canRemoveMember(
    currentUserRole: Role,
    targetUserRole: Role,
    currentUserId: string,
    targetUserId: string,
    ownerId: string,
  ): boolean {
    // Owner can remove anyone
    if (currentUserId === ownerId) return true;
    
    // Cannot remove self
    if (currentUserId === targetUserId) return false;
    
    // Admin can remove MEMBERS and VIEWERS, but not other ADMINS
    if (currentUserRole === Role.ADMIN) {
      return targetUserRole !== Role.ADMIN;
    }
    
    return false;
  }

  static canChangeRole(
    currentUserRole: Role,
    targetUserRole: Role,
    currentUserId: string,
    targetUserId: string,
    ownerId: string,
  ): boolean {
    // Owner can change anyone's role
    if (currentUserId === ownerId) return true;
    
    // Cannot change own role
    if (currentUserId === targetUserId) return false;
    
    // Admin can change MEMBERS and VIEWERS to other roles except ADMIN
    if (currentUserRole === Role.ADMIN) {
      return targetUserRole !== Role.ADMIN;
    }
    
    return false;
  }
}