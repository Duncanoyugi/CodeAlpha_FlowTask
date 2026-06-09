"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectMemberIdSchema = exports.AddProjectMemberSchema = exports.ProjectIdSchema = exports.UpdateProjectSchema = exports.CreateProjectSchema = void 0;
const zod_1 = require("zod");
exports.CreateProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Name must be at least 3 characters').max(100),
        description: zod_1.z.string().max(1000).optional(),
        color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional(),
    }),
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
    }),
});
exports.UpdateProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3).max(100).optional(),
        description: zod_1.z.string().max(1000).optional(),
        color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional(),
    }),
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
    }),
});
exports.ProjectIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
    }),
});
exports.AddProjectMemberSchema = zod_1.z.object({
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
    }),
    body: zod_1.z.object({
        userId: zod_1.z.string().cuid(),
    }),
});
exports.ProjectMemberIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
        memberId: zod_1.z.string().cuid(),
    }),
});
