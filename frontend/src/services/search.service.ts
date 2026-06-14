import { api } from '@lib/axios';

export const searchService = {
  globalSearch: (workspaceId: string, query: string) => api.get(`/search?workspaceId=${workspaceId}&query=${encodeURIComponent(query)}`),
  searchTasks: (workspaceId: string, filters: any) => api.get(`/search/tasks?workspaceId=${workspaceId}`, { params: filters }),
};
