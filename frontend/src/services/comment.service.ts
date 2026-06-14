import { api } from '@lib/axios';

export const commentService = {
  getTaskComments: (taskId: string) => api.get(`/tasks/${taskId}/comments`),
  createComment: (taskId: string, data: { content: string }) => api.post(`/tasks/${taskId}/comments`, data),
  updateComment: (commentId: string, data: { content: string }) => api.patch(`/comments/${commentId}`, data),
  deleteComment: (commentId: string) => api.delete(`/comments/${commentId}`),
};
