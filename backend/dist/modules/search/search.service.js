"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const prisma_1 = require("../../lib/prisma");
const access_resolver_1 = require("../../permissions/access-resolver");
class SearchService {
    async searchGlobal(workspaceId, query, userId) {
        await (0, access_resolver_1.resolveWorkspaceAccess)(workspaceId, userId);
        const accessibleProjectIds = await (0, access_resolver_1.resolveAccessibleProjectIds)(workspaceId, userId);
        const projectFilter = accessibleProjectIds.length > 0 ? { id: { in: accessibleProjectIds } } : { id: { in: [] } };
        const tasks = await prisma_1.prisma.task.findMany({
            where: {
                board: {
                    project: {
                        workspaceId,
                        ...projectFilter,
                    },
                },
                deletedAt: null,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
            include: {
                board: {
                    include: {
                        project: {
                            select: {
                                id: true,
                                name: true,
                                color: true,
                            },
                        },
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
                column: true,
            },
            take: 20,
        });
        const projects = await prisma_1.prisma.project.findMany({
            where: {
                workspaceId,
                deletedAt: null,
                ...projectFilter,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
            include: {
                boards: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            take: 10,
        });
        const comments = await prisma_1.prisma.comment.findMany({
            where: {
                task: {
                    board: {
                        project: {
                            workspaceId,
                            ...projectFilter,
                        },
                    },
                },
                content: { contains: query, mode: 'insensitive' },
            },
            include: {
                task: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
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
            take: 10,
        });
        const users = await prisma_1.prisma.workspaceMember.findMany({
            where: {
                workspaceId,
                OR: [
                    { user: { firstName: { contains: query, mode: 'insensitive' } } },
                    { user: { lastName: { contains: query, mode: 'insensitive' } } },
                    { user: { email: { contains: query, mode: 'insensitive' } } },
                ],
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
            take: 10,
        });
        return {
            tasks,
            projects,
            comments,
            users: users.map((m) => m.user),
        };
    }
    async searchTasks(workspaceId, filters, userId) {
        await (0, access_resolver_1.resolveWorkspaceAccess)(workspaceId, userId);
        const accessibleProjectIds = await (0, access_resolver_1.resolveAccessibleProjectIds)(workspaceId, userId);
        const projectFilter = accessibleProjectIds.length > 0 ? { id: { in: accessibleProjectIds } } : { id: { in: [] } };
        const where = {
            board: {
                project: {
                    workspaceId,
                    ...projectFilter,
                },
            },
            deletedAt: null,
        };
        if (filters.query) {
            where.OR = [
                { title: { contains: filters.query, mode: 'insensitive' } },
                { description: { contains: filters.query, mode: 'insensitive' } },
            ];
        }
        if (filters.assigneeId) {
            where.assigneeId = filters.assigneeId;
        }
        if (filters.priority) {
            where.priority = filters.priority;
        }
        if (filters.dueDateFrom || filters.dueDateTo) {
            where.dueDate = {};
            if (filters.dueDateFrom)
                where.dueDate.gte = filters.dueDateFrom;
            if (filters.dueDateTo)
                where.dueDate.lte = filters.dueDateTo;
        }
        return prisma_1.prisma.task.findMany({
            where,
            include: {
                board: {
                    include: {
                        project: {
                            select: {
                                id: true,
                                name: true,
                                color: true,
                            },
                        },
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
                column: true,
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
            orderBy: { createdAt: 'desc' },
        });
    }
}
exports.SearchService = SearchService;
