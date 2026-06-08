export interface CreateWorkspaceDto {
  name: string;
  description?: string;
  logo?: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
  logo?: string;
}

export interface WorkspaceResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMemberDto {
  id: string;
  userId: string;
  workspaceId: string;
  role: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

export interface UpdateMemberRoleDto {
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}