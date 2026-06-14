import { api } from '@lib/axios';

export const boardService = {
  getProjectBoards: (workspaceId: string, projectId: string) => api.get(`/workspaces/${workspaceId}/projects/${projectId}/boards`),
  getBoard: (boardId: string) => api.get(`/boards/${boardId}`),
};
