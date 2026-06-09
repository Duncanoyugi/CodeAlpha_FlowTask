import { z } from 'zod';

export const CreateColumnSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    position: z.number().int().positive().optional(),
  }),
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
    boardId: z.string().cuid(),
  }),
});

export const UpdateColumnSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    position: z.number().int().positive().optional(),
  }),
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
    boardId: z.string().cuid(),
    columnId: z.string().cuid(),
  }),
});

export const ColumnIdSchema = z.object({
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
    boardId: z.string().cuid(),
    columnId: z.string().cuid(),
  }),
});

export const ReorderColumnsSchema = z.object({
  body: z.object({
    columnIds: z.array(z.string().cuid()),
  }),
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
    boardId: z.string().cuid(),
  }),
});