"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReorderColumnsSchema = exports.ColumnIdSchema = exports.UpdateColumnSchema = exports.CreateColumnSchema = void 0;
const zod_1 = require("zod");
exports.CreateColumnSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(50),
        position: zod_1.z.number().int().positive().optional(),
    }),
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
        boardId: zod_1.z.string().cuid(),
    }),
});
exports.UpdateColumnSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(50).optional(),
        position: zod_1.z.number().int().positive().optional(),
    }),
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
        boardId: zod_1.z.string().cuid(),
        columnId: zod_1.z.string().cuid(),
    }),
});
exports.ColumnIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
        boardId: zod_1.z.string().cuid(),
        columnId: zod_1.z.string().cuid(),
    }),
});
exports.ReorderColumnsSchema = zod_1.z.object({
    body: zod_1.z.object({
        columnIds: zod_1.z.array(zod_1.z.string().cuid()),
    }),
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
        boardId: zod_1.z.string().cuid(),
    }),
});
