import { api } from '@lib/axios';

export const activityService = {
  getTaskActivities: (workspaceId: string, taskId: string) =>
    api.get(`/workspaces/${workspaceId}/activities/tasks/${taskId}`),
  getProjectActivities: (workspaceId: string, projectId: string) =>
    api.get(`/workspaces/${workspaceId}/activities/projects/${projectId}`),
  getWorkspaceActivities: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/activities/workspace`),
};
