export interface CreateProjectDto {
  name: string;
  description?: string;
  color?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  color?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ProjectResponseDto {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  color: string | null;
  startDate: Date | null;
  endDate: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddProjectMemberDto {
  userId: string;
}