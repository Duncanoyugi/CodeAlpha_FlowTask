"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceRepository = void 0;
const prisma_1 = require("../../../src/lib/prisma");
class WorkspaceRepository {
    async create(data) {
        return prisma_1.prisma.workspace.create({
            data,
        });
    }
    async findById(id) {
        return prisma_1.prisma.workspace.findUnique({
            where: { id },
            include: {
                owner: {
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
    async findBySlug(slug) {
        return prisma_1.prisma.workspace.findUnique({
            where: { slug },
        });
    }
    async findAllByUser(userId) {
        const memberships = await prisma_1.prisma.workspaceMember.findMany({
            where: { userId },
            include: {
                workspace: true,
            },
        });
        return memberships.map((m) => m.workspace);
    }
    async update(id, data) {
        return prisma_1.prisma.workspace.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        await prisma_1.prisma.workspace.delete({
            where: { id },
        });
    }
    async addMember(data) {
        return prisma_1.prisma.workspaceMember.create({
            data,
        });
    }
    async removeMember(workspaceId, userId) {
        await prisma_1.prisma.workspaceMember.delete({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
        });
    }
    async updateMemberRole(workspaceId, userId, role) {
        return prisma_1.prisma.workspaceMember.update({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
            data: { role },
        });
    }
    async findMember(workspaceId, userId) {
        return prisma_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
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
    async findAllMembers(workspaceId) {
        return prisma_1.prisma.workspaceMember.findMany({
            where: { workspaceId },
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
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async isMember(workspaceId, userId) {
        const member = await prisma_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
        });
        return !!member;
    }
    async getOwnerId(workspaceId) {
        const workspace = await prisma_1.prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { ownerId: true },
        });
        return workspace?.ownerId || null;
    }
}
exports.WorkspaceRepository = WorkspaceRepository;
