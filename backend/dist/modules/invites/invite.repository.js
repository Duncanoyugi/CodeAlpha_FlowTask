"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteRepository = void 0;
const prisma_1 = require("../../../src/lib/prisma");
class InviteRepository {
    async create(data) {
        return prisma_1.prisma.invite.create({
            data,
        });
    }
    async findByToken(token) {
        const result = await prisma_1.prisma.invite.findUnique({
            where: { token },
            include: {
                workspace: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        return result;
    }
    async findByEmailAndWorkspace(email, workspaceId) {
        return prisma_1.prisma.invite.findFirst({
            where: {
                email,
                workspaceId,
                acceptedAt: null,
                expiresAt: { gt: new Date() },
            },
        });
    }
    async findAllByWorkspace(workspaceId) {
        return prisma_1.prisma.invite.findMany({
            where: { workspaceId },
            include: {
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async acceptInvite(token, recipientId) {
        return prisma_1.prisma.invite.update({
            where: { token },
            data: {
                acceptedAt: new Date(),
                recipientId,
            },
        });
    }
    async deleteExpiredInvites() {
        await prisma_1.prisma.invite.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
                acceptedAt: null,
            },
        });
    }
    async deleteInvite(id) {
        await prisma_1.prisma.invite.delete({
            where: { id },
        });
    }
}
exports.InviteRepository = InviteRepository;
