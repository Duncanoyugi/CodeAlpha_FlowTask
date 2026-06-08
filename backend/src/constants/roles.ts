import { Role } from '../generated/prisma';

export const RoleHierarchy: Record<Role, number> = {
  [Role.ADMIN]: 3,
  [Role.MEMBER]: 2,
  [Role.VIEWER]: 1,
};

export const RolePermissions = {
  [Role.ADMIN]: {
    canDeleteWorkspace: false, // Only owner can
    canManageBilling: false,   // Only owner can
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
  [Role.MEMBER]: {
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
  [Role.VIEWER]: {
    canViewProjects: true,
    canViewTasks: true,
    canComment: true,
    canEditAnything: false,
  },
} as const;

export const hasHigherOrEqualRole = (
  userRole: Role,
  requiredRole: Role
): boolean => {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
};

export const isWorkspaceOwner = (
  userId: string,
  workspaceOwnerId: string
): boolean => {
  return userId === workspaceOwnerId;
};