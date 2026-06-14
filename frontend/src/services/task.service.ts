import { api } from '@lib/axios';

export const taskService = {
  getBoardTasks: (boardId: string) => api.get(`/boards/${boardId}/tasks`),
  getTask: (taskId: string) => api.get(`/tasks/${taskId}`),
  createTask: (boardId: string, columnId: string, data: any) => api.post(`/boards/${boardId}/columns/${columnId}/tasks`, data),
  updateTask: (taskId: string, data: any) => api.patch(`/tasks/${taskId}`, data),
  deleteTask: (taskId: string) => api.delete(`/tasks/${taskId}`),
  moveTask: (taskId: string, data: { columnId: string; position: number }) => api.patch(`/tasks/${taskId}/move`, data),
  reorderTasks: (columnId: string, taskIds: string[]) => api.post(`/columns/${columnId}/tasks/reorder`, { taskIds }),
};
