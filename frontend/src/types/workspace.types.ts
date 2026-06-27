import { Role } from '@constants/roles';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  ownerId: string;
  role?: Role;
  currentUserRole?: Role;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: Role;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

export interface CreateWorkspaceData {
  name: string;
  description?: string;
  logo?: string;
}

export interface UpdateWorkspaceData {
  name?: string;
  description?: string;
  logo?: string;
}

export interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentRole: Role | null;
  members: WorkspaceMember[];
  isLoading: boolean;
  error: string | null;
}