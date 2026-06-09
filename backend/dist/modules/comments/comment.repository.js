"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepository = void 0;
const prisma_1 = require("../../../src/lib/prisma");
class CommentRepository {
    async create(data) {
        return prisma_1.prisma.comment.create({
            data,
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
        });
    }
    async findById(id) {
        return prisma_1.prisma.comment.findUnique({
            where: { id },
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
                mentions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findAllByTask(taskId) {
        return prisma_1.prisma.comment.findMany({
            where: { taskId },
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
                mentions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async update(id, content) {
        return prisma_1.prisma.comment.update({
            where: { id },
            data: {
                content,
                editedAt: new Date(),
            },
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
        });
    }
    async delete(id) {
        await prisma_1.prisma.comment.delete({
            where: { id },
        });
    }
    async createMention(commentId, userId, taskId) {
        await prisma_1.prisma.commentMention.create({
            data: {
                commentId,
                userId,
                taskId,
            },
        });
    }
    async deleteMentions(commentId) {
        await prisma_1.prisma.commentMention.deleteMany({
            where: { commentId },
        });
    }
    async getTaskId(commentId) {
        const comment = await prisma_1.prisma.comment.findUnique({
            where: { id: commentId },
            select: { taskId: true },
        });
        return comment?.taskId || null;
    }
}
exports.CommentRepository = CommentRepository;
