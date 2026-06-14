import { Role } from '../generated/prisma';

export const RoleHierarchy: Record<Role, number> = {
  [Role.ADMIN]: 3,
  [Role.MEMBER]: 2,
  [Role.VIEWER]: 1,
};

export interface RolePermissionSet {
  canCreateWorkspace: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canChangeRoles: boolean;
  canCreateProject: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;
  canCreateBoard: boolean;
  canEditBoard: boolean;
  canDeleteBoard: boolean;
  canCreateColumn: boolean;
  canEditColumn: boolean;
  canDeleteColumn: boolean;
  canReorderColumns: boolean;
  canCreateTask: boolean;
  canEditAnyTask: boolean;
  canDeleteAnyTask: boolean;
  canMoveAnyTask: boolean;
  canManageAllTasks: boolean;
  canManageOwnTasks: boolean;
  canCompleteTask: boolean;
  canAddLabels: boolean;
  canAddAttachments: boolean;
  canComment: boolean;
  canEditOwnComment: boolean;
  canDeleteOwnComment: boolean;
  canViewProjects: boolean;
  canViewBoards: boolean;
  canViewTasks: boolean;
  canViewComments: boolean;
  canViewActivityLogs: boolean;
  canViewAnalytics: boolean;
  canViewCharts: boolean;
  canViewTeamMetrics: boolean;
  canExportData: boolean;
  canDeleteWorkspace: boolean;
  canManageBilling: boolean;
}

export const RolePermissions: Record<Role, RolePermissionSet> = {
  [Role.ADMIN]: {
    canCreateWorkspace: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeRoles: true,
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: true,
    canCreateBoard: true,
    canEditBoard: true,
    canDeleteBoard: true,
    canCreateColumn: true,
    canEditColumn: true,
    canDeleteColumn: true,
    canReorderColumns: true,
    canCreateTask: true,
    canEditAnyTask: true,
    canDeleteAnyTask: true,
    canMoveAnyTask: true,
    canManageAllTasks: true,
    canManageOwnTasks: true,
    canCompleteTask: true,
    canAddLabels: true,
    canAddAttachments: true,
    canComment: true,
    canEditOwnComment: true,
    canDeleteOwnComment: true,
    canViewProjects: true,
    canViewBoards: true,
    canViewTasks: true,
    canViewComments: true,
    canViewActivityLogs: true,
    canViewAnalytics: true,
    canViewCharts: true,
    canViewTeamMetrics: true,
    canExportData: true,
    canDeleteWorkspace: false,
    canManageBilling: false,
  },
  [Role.MEMBER]: {
    canCreateWorkspace: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canCreateBoard: false,
    canEditBoard: false,
    canDeleteBoard: false,
    canCreateColumn: false,
    canEditColumn: false,
    canDeleteColumn: false,
    canReorderColumns: false,
    canCreateTask: true,
    canEditAnyTask: false,
    canDeleteAnyTask: false,
    canMoveAnyTask: false,
    canManageAllTasks: false,
    canManageOwnTasks: true,
    canCompleteTask: true,
    canAddLabels: true,
    canAddAttachments: true,
    canComment: true,
    canEditOwnComment: true,
    canDeleteOwnComment: true,
    canViewProjects: true,
    canViewBoards: true,
    canViewTasks: true,
    canViewComments: true,
    canViewActivityLogs: true,
    canViewAnalytics: false,
    canViewCharts: false,
    canViewTeamMetrics: false,
    canExportData: false,
    canDeleteWorkspace: false,
    canManageBilling: false,
  },
  [Role.VIEWER]: {
    canCreateWorkspace: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canCreateBoard: false,
    canEditBoard: false,
    canDeleteBoard: false,
    canCreateColumn: false,
    canEditColumn: false,
    canDeleteColumn: false,
    canReorderColumns: false,
    canCreateTask: false,
    canEditAnyTask: false,
    canDeleteAnyTask: false,
    canMoveAnyTask: false,
    canManageAllTasks: false,
    canManageOwnTasks: false,
    canCompleteTask: false,
    canAddLabels: false,
    canAddAttachments: false,
    canComment: true,
    canEditOwnComment: false,
    canDeleteOwnComment: false,
    canViewProjects: true,
    canViewBoards: true,
    canViewTasks: true,
    canViewComments: true,
    canViewActivityLogs: false,
    canViewAnalytics: false,
    canViewCharts: false,
    canViewTeamMetrics: false,
    canExportData: false,
    canDeleteWorkspace: false,
    canManageBilling: false,
  },
};

export const hasHigherOrEqualRole = (
  userRole: Role,
  requiredRole: Role
): boolean => {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
};

export const getRolePermissions = (role: Role): RolePermissionSet => RolePermissions[role];

export const hasRolePermission = (
  role: Role,
  permission: keyof RolePermissionSet
): boolean => RolePermissions[role][permission];

export const isWorkspaceOwner = (
  userId: string,
  workspaceOwnerId: string
): boolean => {
  return userId === workspaceOwnerId;
};

export const canManageWorkspaceResources = (
  userRole: Role,
  userId: string,
  workspaceOwnerId: string,
): boolean => userRole === Role.ADMIN || isWorkspaceOwner(userId, workspaceOwnerId);

export const canManageWorkspaceMembers = (
  userRole: Role,
): boolean => userRole === Role.ADMIN;