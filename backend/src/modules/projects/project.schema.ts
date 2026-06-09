import { z } from 'zod';

export const CreateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100),
    description: z.string().max(1000).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
  params: z.object({
    workspaceId: z.string().cuid(),
  }),
});

export const UpdateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().max(1000).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
  }),
});

export const ProjectIdSchema = z.object({
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
  }),
});

export const AddProjectMemberSchema = z.object({
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
  }),
  body: z.object({
    userId: z.string().cuid(),
  }),
});

export const ProjectMemberIdSchema = z.object({
  params: z.object({
    workspaceId: z.string().cuid(),
    projectId: z.string().cuid(),
    memberId: z.string().cuid(),
  }),
});