import { z } from 'zod';

export const CreateWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(50),
    description: z.string().max(500).optional(),
    logo: z.string().url().optional(),
  }),
});

export const UpdateWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(50).optional(),
    description: z.string().max(500).optional(),
    logo: z.string().url().optional(),
  }),
  params: z.object({
    workspaceId: z.string().cuid(),
  }),
});

export const WorkspaceIdSchema = z.object({
  params: z.object({
    workspaceId: z.string().cuid(),
  }),
});

export const TransferOwnershipSchema = z.object({
  params: z.object({
    workspaceId: z.string().cuid(),
  }),
  body: z.object({
    newOwnerId: z.string().cuid(),
  }),
});

export const UpdateMemberRoleSchema = z.object({
  params: z.object({
    workspaceId: z.string().cuid(),
    memberId: z.string().cuid(),
  }),
  body: z.object({
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
  }),
});

export const InviteMemberSchema = z.object({
  params: z.object({
    workspaceId: z.string().cuid(),
  }),
  body: z.object({
    email: z.string().email('Invalid email format'),
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
  }),
});