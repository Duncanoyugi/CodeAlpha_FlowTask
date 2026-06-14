export interface Project {
  id: string;
  name: string;
  description?: string | null;
  color?: string;
  workspaceId: string;
  ownerId: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    boards: number;
  };
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
}

export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
  workspaceId?: string;
  endDate?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  color?: string;
  endDate?: string | null;
}
