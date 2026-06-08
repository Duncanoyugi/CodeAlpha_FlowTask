"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteMemberSchema = exports.UpdateMemberRoleSchema = exports.WorkspaceIdSchema = exports.UpdateWorkspaceSchema = exports.CreateWorkspaceSchema = void 0;
const zod_1 = require("zod");
exports.CreateWorkspaceSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Name must be at least 3 characters').max(50),
        description: zod_1.z.string().max(500).optional(),
        logo: zod_1.z.string().url().optional(),
    }),
});
exports.UpdateWorkspaceSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3).max(50).optional(),
        description: zod_1.z.string().max(500).optional(),
        logo: zod_1.z.string().url().optional(),
    }),
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
    }),
});
exports.WorkspaceIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
    }),
});
exports.UpdateMemberRoleSchema = zod_1.z.object({
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        memberId: zod_1.z.string().cuid(),
    }),
    body: zod_1.z.object({
        role: zod_1.z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
    }),
});
exports.InviteMemberSchema = zod_1.z.object({
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
    }),
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        role: zod_1.z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
    }),
});
