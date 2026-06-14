"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const prisma_1 = require("../../lib/prisma");
const error_1 = require("../../utils/error");
const project_access_permissions_1 = require("../../permissions/project-access.permissions");
class SearchService {
    async getAccessibleProjectIds(workspaceId, userId) {
        const member = await prisma_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
        });
        if (!member) {
            throw new error_1.ForbiddenError('You do not have access to this workspace');
        }
        const restrictedProjects = await prisma_1.prisma.projectMember.findMany({
            where: { project: { workspaceId } },
            select: { projectId: true },
            distinct: ['projectId'],
        });
        const restrictedProjectIds = restrictedProjects.map((projectMember) => projectMember.projectId);
        if (restrictedProjectIds.length === 0) {
            return [];
        }
        const accessibleProjectIds = [];
        for (const projectId of restrictedProjectIds) {
            try {
                await (0, project_access_permissions_1.assertProjectAccess)(projectId, userId);
                accessibleProjectIds.push(projectId);
            }
            catch {
                // Project is restricted and user is not a project member.
            }
        }
        return accessibleProjectIds;
    }
    async searchGlobal(workspaceId, query, userId) {
        // Verify user has access to workspace
        const member = await prisma_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
        });
        if (!member) {
            throw new Error('Access denied');
        }
        const accessibleProjectIds = await this.getAccessibleProjectIds(workspaceId, userId);
        const searchTerm = `%${query}%`;
        // Search tasks
        const tasks = await prisma_1.prisma.task.findMany({
            where: {
                board: {
                    project: {
                        workspaceId,
                        ...(accessibleProjectIds.length > 0 ? { id: { in: accessibleProjectIds } } : {}),
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
        // Search projects
        const projects = await prisma_1.prisma.project.findMany({
            where: {
                workspaceId,
                deletedAt: null,
                ...(accessibleProjectIds.length > 0 ? { id: { in: accessibleProjectIds } } : {}),
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
        // Search comments
        const comments = await prisma_1.prisma.comment.findMany({
            where: {
                task: {
                    board: {
                        project: {
                            workspaceId,
                            ...(accessibleProjectIds.length > 0 ? { id: { in: accessibleProjectIds } } : {}),
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
        // Search users in workspace
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
            users: users.map(m => m.user),
        };
    }
    async searchTasks(workspaceId, filters, userId) {
        const member = await prisma_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
        });
        if (!member) {
            throw new Error('Access denied');
        }
        const accessibleProjectIds = await this.getAccessibleProjectIds(workspaceId, userId);
        const where = {
            board: {
                project: {
                    workspaceId,
                    ...(accessibleProjectIds.length > 0 ? { id: { in: accessibleProjectIds } } : {}),
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
