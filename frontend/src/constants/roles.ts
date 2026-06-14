export const Role = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const RoleLabels: Record<Role, string> = {
  [Role.OWNER]: 'Owner',
  [Role.ADMIN]: 'Admin',
  [Role.MEMBER]: 'Member',
  [Role.VIEWER]: 'Viewer',
};

export const RoleColors: Record<Role, string> = {
  [Role.OWNER]: 'bg-purple-100 text-purple-800',
  [Role.ADMIN]: 'bg-purple-100 text-purple-800',
  [Role.MEMBER]: 'bg-blue-100 text-blue-800',
  [Role.VIEWER]: 'bg-gray-100 text-gray-800',
};

export interface RolePermissionSet {
  canCreateWorkspace: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canChangeRoles: boolean;
  canCreateProject: boolean;
  canDeleteProject: boolean;
  canCreateBoard: boolean;
  canDeleteBoard: boolean;
  canManageAllTasks: boolean;
  canManageOwnTasks: boolean;
  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canMoveTask: boolean;
  canAddLabels: boolean;
  canUploadAttachments: boolean;
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
  canTransferOwnership: boolean;
  canManageBilling: boolean;
}

const basePermissions: RolePermissionSet = {
  canCreateWorkspace: true,
  canInviteMembers: true,
  canRemoveMembers: true,
  canChangeRoles: true,
  canCreateProject: true,
  canDeleteProject: true,
  canCreateBoard: true,
  canDeleteBoard: true,
  canManageAllTasks: true,
  canManageOwnTasks: true,
  canCreateTask: true,
  canEditTask: true,
  canDeleteTask: true,
  canMoveTask: true,
  canAddLabels: true,
  canUploadAttachments: true,
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
  canTransferOwnership: false,
  canManageBilling: false,
};

export const RolePermissions: Record<Role, RolePermissionSet> = {
  [Role.OWNER]: {
    ...basePermissions,
    canDeleteWorkspace: true,
    canTransferOwnership: true,
    canManageBilling: true,
  },
  [Role.ADMIN]: { ...basePermissions },
  [Role.MEMBER]: {
    canCreateWorkspace: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canCreateProject: false,
    canDeleteProject: false,
    canCreateBoard: false,
    canDeleteBoard: false,
    canManageAllTasks: false,
    canManageOwnTasks: true,
    canCreateTask: true,
    canEditTask: false,
    canDeleteTask: false,
    canMoveTask: false,
    canAddLabels: true,
    canUploadAttachments: true,
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
    canTransferOwnership: false,
    canManageBilling: false,
  },
  [Role.VIEWER]: {
    canCreateWorkspace: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canCreateProject: false,
    canDeleteProject: false,
    canCreateBoard: false,
    canDeleteBoard: false,
    canManageAllTasks: false,
    canManageOwnTasks: false,
    canCreateTask: false,
    canEditTask: false,
    canDeleteTask: false,
    canMoveTask: false,
    canAddLabels: false,
    canUploadAttachments: false,
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
    canTransferOwnership: false,
    canManageBilling: false,
  },
};

export type RolePermissionKey = keyof RolePermissionSet;

export const getRolePermissions = (role: Role): RolePermissionSet => RolePermissions[role];

export const hasRolePermission = (role: Role, permission: RolePermissionKey): boolean =>
  RolePermissions[role][permission];

export const getWorkspaceRolePermissions = (
  role: Role,
  isOwner: boolean,
): RolePermissionSet => {
  if (!isOwner) return RolePermissions[role];

  return RolePermissions[Role.OWNER];
};

export const isWorkspaceOwner = (workspaceOwnerId: string, userId: string): boolean =>
  workspaceOwnerId === userId;
