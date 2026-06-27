"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskRepository = void 0;
const prisma_1 = require("../../../src/lib/prisma");
class TaskRepository {
    async create(data) {
        return prisma_1.prisma.task.create({
            data,
            include: {
                reporter: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
    }
    async findById(id) {
        return prisma_1.prisma.task.findUnique({
            where: { id, deletedAt: null },
            include: {
                reporter: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
                labels: {
                    include: {
                        label: true,
                    },
                },
                comments: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        author: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
                attachments: true,
                _count: {
                    select: {
                        comments: true,
                        attachments: true,
                    },
                },
            },
        });
    }
    async findAllByColumn(columnId) {
        return prisma_1.prisma.task.findMany({
            where: { columnId, deletedAt: null },
            include: {
                assignee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
                labels: {
                    include: {
                        label: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        attachments: true,
                    },
                },
            },
            orderBy: { position: 'asc' },
        });
    }
    async findAllByBoard(boardId) {
        return prisma_1.prisma.task.findMany({
            where: { boardId, deletedAt: null },
            include: {
                column: true,
                assignee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
                labels: {
                    include: {
                        label: true,
                    },
                },
            },
            orderBy: [{ columnId: 'asc' }, { position: 'asc' }],
        });
    }
    async update(id, data) {
        return prisma_1.prisma.task.update({
            where: { id },
            data,
            include: {
                reporter: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
    }
    async updatePosition(id, columnId, position) {
        return prisma_1.prisma.task.update({
            where: { id },
            data: {
                columnId,
                position,
            },
        });
    }
    async softDelete(id) {
        await prisma_1.prisma.task.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async hardDelete(id) {
        await prisma_1.prisma.task.delete({
            where: { id },
        });
    }
    async getMaxPosition(columnId) {
        const maxPosition = await prisma_1.prisma.task.aggregate({
            where: { columnId },
            _max: { position: true },
        });
        return (maxPosition._max.position || 0) + 100;
    }
    async reorderTasks(columnId, taskIds) {
        // Repository-level implementation (non-transactional). For atomicity, prefer
        // calling TaskService methods that wrap this in prisma.$transaction.
        await Promise.all(taskIds.map((taskId, index) => prisma_1.prisma.task.update({
            where: { id: taskId },
            data: { position: (index + 1) * 100 },
        })));
    }
    async getColumnId(taskId) {
        const task = await prisma_1.prisma.task.findUnique({
            where: { id: taskId },
            select: { columnId: true },
        });
        return task?.columnId || null;
    }
    async getBoardId(taskId) {
        const task = await prisma_1.prisma.task.findUnique({
            where: { id: taskId },
            select: { boardId: true },
        });
        return task?.boardId || null;
    }
    async findAllByAssignee(assigneeId) {
        return prisma_1.prisma.task.findMany({
            where: { assigneeId, deletedAt: null },
            include: {
                board: {
                    include: {
                        project: {
                            include: {
                                workspace: true,
                            },
                        },
                    },
                },
                column: true,
            },
            orderBy: { dueDate: 'asc' },
        });
    }
}
exports.TaskRepository = TaskRepository;
