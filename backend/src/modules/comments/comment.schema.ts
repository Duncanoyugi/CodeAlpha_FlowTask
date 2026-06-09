import { z } from 'zod';

export const CreateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(5000),
  }),
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
    boardId: z.string().cuid(),
    columnId: z.string().cuid(),
    taskId: z.string().cuid(),
  }),
});

export const UpdateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(5000),
  }),
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
    boardId: z.string().cuid(),
    columnId: z.string().cuid(),
    taskId: z.string().cuid(),
    commentId: z.string().cuid(),
  }),
});

export const CommentIdSchema = z.object({
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
    boardId: z.string().cuid(),
    columnId: z.string().cuid(),
    taskId: z.string().cuid(),
    commentId: z.string().cuid(),
  }),
});