"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectRepository = void 0;
const prisma_1 = require("../../../src/lib/prisma");
class ProjectRepository {
    async create(data) {
        return prisma_1.prisma.project.create({
            data,
        });
    }
    async findById(id) {
        return prisma_1.prisma.project.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                boards: {
                    select: {
                        id: true,
                        name: true,
                        _count: {
                            select: { tasks: true },
                        },
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findAllByWorkspace(workspaceId) {
        return prisma_1.prisma.project.findMany({
            where: { workspaceId, deletedAt: null },
            include: {
                boards: {
                    select: {
                        id: true,
                        name: true,
                        _count: {
                            select: { tasks: true },
                        },
                    },
                },
                _count: {
                    select: { members: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(id, data) {
        return prisma_1.prisma.project.update({
            where: { id },
            data,
        });
    }
    async softDelete(id) {
        await prisma_1.prisma.project.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async hardDelete(id) {
        await prisma_1.prisma.project.delete({
            where: { id },
        });
    }
    async addMember(projectId, userId) {
        return prisma_1.prisma.projectMember.create({
            data: {
                projectId,
                userId,
            },
        });
    }
    async removeMember(projectId, userId) {
        await prisma_1.prisma.projectMember.delete({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });
    }
    async findMember(projectId, userId) {
        return prisma_1.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });
    }
    async findAllMembers(projectId) {
        return prisma_1.prisma.projectMember.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
    }
    async isMember(projectId, userId) {
        const member = await prisma_1.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });
        return !!member;
    }
    async getWorkspaceId(projectId) {
        const project = await prisma_1.prisma.project.findUnique({
            where: { id: projectId },
            select: { workspaceId: true },
        });
        return project?.workspaceId || null;
    }
}
exports.ProjectRepository = ProjectRepository;
