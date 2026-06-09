import { z } from 'zod';

export const CreateBoardSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(50),
  }),
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
  }),
});

export const UpdateBoardSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(50).optional(),
  }),
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
    boardId: z.string().cuid(),
  }),
});

export const BoardIdSchema = z.object({
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
    boardId: z.string().cuid(),
  }),
});