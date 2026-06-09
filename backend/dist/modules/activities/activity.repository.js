"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityRepository = void 0;
const prisma_1 = require("../../../src/lib/prisma");
class ActivityRepository {
    async create(data) {
        return prisma_1.prisma.activity.create({
            data,
        });
    }
    async findAllByWorkspace(workspaceId, limit = 50) {
        return prisma_1.prisma.activity.findMany({
            where: { workspaceId },
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
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async findAllByEntity(entityType, entityId) {
        return prisma_1.prisma.activity.findMany({
            where: { entityType, entityId },
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
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAllByTask(taskId) {
        return prisma_1.prisma.activity.findMany({
            where: { taskId },
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
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAllByProject(projectId) {
        return prisma_1.prisma.activity.findMany({
            where: { projectId },
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
            orderBy: { createdAt: 'desc' },
        });
    }
}
exports.ActivityRepository = ActivityRepository;
