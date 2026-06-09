"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptInviteSchema = exports.InviteTokenSchema = exports.CreateInviteSchema = void 0;
const zod_1 = require("zod");
exports.CreateInviteSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        role: zod_1.z.enum(['ADMIN', 'MEMBER', 'VIEWER']).optional().default('MEMBER'),
    }),
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
    }),
});
exports.InviteTokenSchema = zod_1.z.object({
    query: zod_1.z.object({
        token: zod_1.z.string().min(1),
    }),
});
exports.AcceptInviteSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string().min(1),
    }),
});
