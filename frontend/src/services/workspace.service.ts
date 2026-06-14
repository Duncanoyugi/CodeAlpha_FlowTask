import { api } from '@lib/axios';
import type { ApiResponse } from '@services/api';
import type { Workspace, CreateWorkspaceData, UpdateWorkspaceData, WorkspaceMember } from '@/types/workspace.types';

export const workspaceService = {
  getUserWorkspaces: () => {
    return api.get<ApiResponse<Workspace[]>>('/workspaces');
  },
  
  getWorkspace: (workspaceId: string) => {
    return api.get<ApiResponse<Workspace>>(`/workspaces/${workspaceId}`);
  },
  
  createWorkspace: (data: CreateWorkspaceData) => {
    return api.post<ApiResponse<Workspace>>('/workspaces', data);
  },
  
  updateWorkspace: (workspaceId: string, data: UpdateWorkspaceData) => {
    return api.patch<ApiResponse<Workspace>>(`/workspaces/${workspaceId}`, data);
  },
  
  deleteWorkspace: (workspaceId: string) => {
    return api.delete(`/workspaces/${workspaceId}`);
  },
  
  getWorkspaceMembers: (workspaceId: string) => {
    return api.get<ApiResponse<WorkspaceMember[]>>(`/workspaces/${workspaceId}/members`);
  },
  
  updateMemberRole: (workspaceId: string, memberId: string, role: string) => {
    return api.patch<ApiResponse<WorkspaceMember>>(`/workspaces/${workspaceId}/members/${memberId}/role`, { role });
  },
  
  removeMember: (workspaceId: string, memberId: string) => {
    return api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  },
};