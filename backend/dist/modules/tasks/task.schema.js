"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveTaskSchema = exports.TaskIdSchema = exports.UpdateTaskSchema = exports.CreateTaskSchema = void 0;
const zod_1 = require("zod");
const priorityEnum = zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
exports.CreateTaskSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(200),
        description: zod_1.z.string().max(5000).optional(),
        priority: priorityEnum.optional().default('MEDIUM'),
        dueDate: zod_1.z.string().datetime().optional(),
        assigneeId: zod_1.z.string().cuid().optional(),
    }),
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
        boardId: zod_1.z.string().cuid(),
        columnId: zod_1.z.string().cuid(),
    }),
});
exports.UpdateTaskSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3).max(200).optional(),
        description: zod_1.z.string().max(5000).optional(),
        priority: priorityEnum.optional(),
        dueDate: zod_1.z.string().datetime().optional(),
        assigneeId: zod_1.z.string().cuid().nullable().optional(),
    }),
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
        boardId: zod_1.z.string().cuid(),
        columnId: zod_1.z.string().cuid(),
        taskId: zod_1.z.string().cuid(),
    }),
});
exports.TaskIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
        boardId: zod_1.z.string().cuid(),
        columnId: zod_1.z.string().cuid(),
        taskId: zod_1.z.string().cuid(),
    }),
});
exports.MoveTaskSchema = zod_1.z.object({
    body: zod_1.z.object({
        columnId: zod_1.z.string().cuid(),
        position: zod_1.z.number().int().min(0),
    }),
    params: zod_1.z.object({
        workspaceId: zod_1.z.string().cuid(),
        projectId: zod_1.z.string().cuid(),
        boardId: zod_1.z.string().cuid(),
        taskId: zod_1.z.string().cuid(),
    }),
});
