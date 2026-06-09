"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardRepository = void 0;
const prisma_1 = require("../../../src/lib/prisma");
class BoardRepository {
    async create(data) {
        return prisma_1.prisma.board.create({
            data,
        });
    }
    async findById(id) {
        return prisma_1.prisma.board.findUnique({
            where: { id },
            include: {
                columns: {
                    orderBy: { position: 'asc' },
                    include: {
                        tasks: {
                            orderBy: { position: 'asc' },
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
                                reporter: {
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
                        },
                    },
                },
            },
        });
    }
    async findAllByProject(projectId) {
        return prisma_1.prisma.board.findMany({
            where: { projectId, deletedAt: null },
            include: {
                columns: {
                    orderBy: { position: 'asc' },
                    include: {
                        _count: {
                            select: { tasks: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async update(id, data) {
        return prisma_1.prisma.board.update({
            where: { id },
            data,
        });
    }
    async softDelete(id) {
        await prisma_1.prisma.board.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async hardDelete(id) {
        await prisma_1.prisma.board.delete({
            where: { id },
        });
    }
    async getProjectId(boardId) {
        const board = await prisma_1.prisma.board.findUnique({
            where: { id: boardId },
            select: { projectId: true },
        });
        return board?.projectId || null;
    }
}
exports.BoardRepository = BoardRepository;
