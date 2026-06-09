"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentIdSchema = exports.UpdateCommentSchema = exports.CreateCommentSchema = void 0;
const zod_1 = require("zod");
exports.CreateCommentSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, 'Comment cannot be empty').max(5000),
    }),
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
        boardId: zod_1.z.string().cuid(),
        columnId: zod_1.z.string().cuid(),
        taskId: zod_1.z.string().cuid(),
    }),
});
exports.UpdateCommentSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1).max(5000),
    }),
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
        boardId: zod_1.z.string().cuid(),
        columnId: zod_1.z.string().cuid(),
        taskId: zod_1.z.string().cuid(),
        commentId: zod_1.z.string().cuid(),
    }),
});
exports.CommentIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
        boardId: zod_1.z.string().cuid(),
        columnId: zod_1.z.string().cuid(),
        taskId: zod_1.z.string().cuid(),
        commentId: zod_1.z.string().cuid(),
    }),
});
