import { api } from '@lib/axios';

export const columnService = {
  getBoardColumns: (boardId: string) => api.get(`/boards/${boardId}/columns`),
  createColumn: (boardId: string, data: { name: string }) => api.post(`/boards/${boardId}/columns`, data),
  updateColumn: (boardId: string, columnId: string, data: { name: string }) => api.patch(`/boards/${boardId}/columns/${columnId}`, data),
  deleteColumn: (boardId: string, columnId: string) => api.delete(`/boards/${boardId}/columns/${columnId}`),
  reorderColumns: (boardId: string, columnIds: string[]) => api.post(`/boards/${boardId}/columns/reorder`, { columnIds }),
};
