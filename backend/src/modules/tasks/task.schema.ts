import { z } from 'zod';

const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const CreateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().max(5000).optional(),
    priority: priorityEnum.optional().default('MEDIUM'),
    dueDate: z.string().datetime().optional(),
    assigneeId: z.string().cuid().optional(),
  }),
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
    boardId: z.string().cuid(),
    columnId: z.string().cuid(),
  }),
});

export const UpdateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().max(5000).optional(),
    priority: priorityEnum.optional(),
    dueDate: z.string().datetime().optional(),
    assigneeId: z.string().cuid().nullable().optional(),
  }),
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
    boardId: z.string().cuid(),
    columnId: z.string().cuid(),
    taskId: z.string().cuid(),
  }),
});

export const TaskIdSchema = z.object({
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
    boardId: z.string().cuid(),
    columnId: z.string().cuid(),
    taskId: z.string().cuid(),
  }),
});

export const MoveTaskSchema = z.object({
  body: z.object({
    columnId: z.string().cuid(),
    position: z.number().int().min(0),
  }),
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
    boardId: z.string().cuid(),
    taskId: z.string().cuid(),
  }),
});