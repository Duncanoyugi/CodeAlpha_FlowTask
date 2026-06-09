"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardIdSchema = exports.UpdateBoardSchema = exports.CreateBoardSchema = void 0;
const zod_1 = require("zod");
exports.CreateBoardSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Name must be at least 3 characters').max(50),
    }),
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
    }),
});
exports.UpdateBoardSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3).max(50).optional(),
    }),
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
        boardId: zod_1.z.string().cuid(),
    }),
});
exports.BoardIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
        boardId: zod_1.z.string().cuid(),
    }),
});
