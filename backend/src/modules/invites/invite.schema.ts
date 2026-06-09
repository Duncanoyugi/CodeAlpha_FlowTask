import { z } from 'zod';

export const CreateInviteSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).optional().default('MEMBER'),
  }),
  params: z.object({
    workspaceId: z.string().cuid(),
  }),
});

export const InviteTokenSchema = z.object({
  query: z.object({
    token: z.string().min(1),
  }),
});

export const AcceptInviteSchema = z.object({
  body: z.object({
    token: z.string().min(1),
  }),
});