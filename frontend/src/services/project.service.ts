import { api } from '@lib/axios';
import type { ApiResponse } from '@services/api';
import type { Project, CreateProjectData, UpdateProjectData, ProjectMember } from '@/types/project.types';

export const projectService = {
  getWorkspaceProjects: (workspaceId: string) => {
    return api.get<ApiResponse<Project[]>>(`/workspaces/${workspaceId}/projects`);
  },
  
  getProject: (projectId: string) => {
    return api.get<ApiResponse<Project>>(`/projects/${projectId}`);
  },
  
  createProject: (workspaceId: string, data: CreateProjectData) => {
    return api.post<ApiResponse<Project>>(`/workspaces/${workspaceId}/projects`, data);
  },
  
  updateProject: (projectId: string, data: UpdateProjectData) => {
    return api.patch<ApiResponse<Project>>(`/projects/${projectId}`, data);
  },
  
  deleteProject: (projectId: string) => {
    return api.delete(`/projects/${projectId}`);
  },
  
  getProjectMembers: (projectId: string) => {
    return api.get<ApiResponse<ProjectMember[]>>(`/projects/${projectId}/members`);
  },
  
  addProjectMember: (projectId: string, userId: string) => {
    return api.post<ApiResponse<ProjectMember>>(`/projects/${projectId}/members`, { userId });
  },
  
  removeProjectMember: (projectId: string, memberId: string) => {
    return api.delete(`/projects/${projectId}/members/${memberId}`);
  },
};