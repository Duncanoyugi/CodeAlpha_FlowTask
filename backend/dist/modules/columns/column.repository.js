"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnRepository = void 0;
const prisma_1 = require("../../../src/lib/prisma");
class ColumnRepository {
    async create(data) {
        return prisma_1.prisma.column.create({
            data,
        });
    }
    async findById(id) {
        return prisma_1.prisma.column.findUnique({
            where: { id },
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
        });
    }
    async findAllByBoard(boardId) {
        return prisma_1.prisma.column.findMany({
            where: { boardId },
            include: {
                _count: {
                    select: { tasks: true },
                },
            },
            orderBy: { position: 'asc' },
        });
    }
    async update(id, data) {
        return prisma_1.prisma.column.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        await prisma_1.prisma.column.delete({
            where: { id },
        });
    }
    async getMaxPosition(boardId) {
        const maxPosition = await prisma_1.prisma.column.aggregate({
            where: { boardId },
            _max: { position: true },
        });
        return (maxPosition._max.position || 0) + 100;
    }
    async reorderColumns(columnIds) {
        // Update each column's position based on array index
        for (let i = 0; i < columnIds.length; i++) {
            await prisma_1.prisma.column.update({
                where: { id: columnIds[i] },
                data: { position: (i + 1) * 100 },
            });
        }
    }
    async getBoardId(columnId) {
        const column = await prisma_1.prisma.column.findUnique({
            where: { id: columnId },
            select: { boardId: true },
        });
        return column?.boardId || null;
    }
}
exports.ColumnRepository = ColumnRepository;
