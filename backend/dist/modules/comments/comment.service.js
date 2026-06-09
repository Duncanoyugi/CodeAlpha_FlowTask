"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const comment_repository_1 = require("./comment.repository");
const error_1 = require("../../../src/utils/error");
const prisma_1 = require("../../../src/lib/prisma");
const prisma_2 = require("../../generated/prisma");
class CommentService {
    commentRepository;
    constructor() {
        this.commentRepository = new comment_repository_1.CommentRepository();
    }
    async checkTaskAccess(taskId, userId) {
        const task = await prisma_1.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                board: {
                    include: {
                        project: {
                            include: {
                                workspace: {
                                    include: {
                                        members: {
                                            where: { userId },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!task) {
            throw new error_1.NotFoundError('Task');
        }
        const member = task.board.project.workspace.members[0];
        if (!member) {
            throw new error_1.ForbiddenError('You do not have access to this task');
        }
        return member.role;
    }
    extractMentions(content) {
        const mentionRegex = /@(\w+)/g;
        const matches = content.matchAll(mentionRegex);
        const mentions = new Set();
        for (const match of matches) {
            mentions.add(match[1]);
        }
        return Array.from(mentions);
    }
    async resolveMentions(usernames, workspaceId) {
        // Find users by firstName or email that match the mention
        const users = await prisma_1.prisma.workspaceMember.findMany({
            where: {
                workspaceId,
                user: {
                    OR: [
                        { firstName: { in: usernames } },
                        { email: { in: usernames.map(u => `${u}@example.com`) } }, // Simplified
                    ],
                },
            },
            include: {
                user: true,
            },
        });
        return users.map(m => m.user.id);
    }
    async createComment(taskId, userId, data) {
        const userRole = await this.checkTaskAccess(taskId, userId);
        // All roles including VIEWER can comment
        const comment = await this.commentRepository.create({
            taskId,
            authorId: userId,
            content: data.content,
        });
        // Extract and create mentions
        const mentions = this.extractMentions(data.content);
        if (mentions.length > 0) {
            // Get workspace ID for mention resolution
            const task = await prisma_1.prisma.task.findUnique({
                where: { id: taskId },
                include: {
                    board: {
                        include: {
                            project: true,
                        },
                    },
                },
            });
            const workspaceId = task?.board.project.workspaceId;
            if (workspaceId) {
                const mentionedUserIds = await this.resolveMentions(mentions, workspaceId);
                for (const mentionedUserId of mentionedUserIds) {
                    await this.commentRepository.createMention(comment.id, mentionedUserId, taskId);
                    // Create notification for mention
                    const author = await prisma_1.prisma.user.findUnique({
                        where: { id: userId },
                        select: { firstName: true, lastName: true },
                    });
                    await prisma_1.prisma.notification.create({
                        data: {
                            userId: mentionedUserId,
                            type: 'MENTION',
                            title: 'You were mentioned',
                            message: `${author?.firstName || 'Someone'} ${author?.lastName || ''} mentioned you in a comment`.trim(),
                            actionUrl: `/tasks/${taskId}`,
                            metadata: {
                                taskId,
                                commentId: comment.id,
                            },
                        },
                    });
                }
            }
        }
        return comment;
    }
    async getCommentById(commentId, userId) {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) {
            throw new error_1.NotFoundError('Comment');
        }
        await this.checkTaskAccess(comment.taskId, userId);
        return comment;
    }
    async getTaskComments(taskId, userId) {
        await this.checkTaskAccess(taskId, userId);
        return this.commentRepository.findAllByTask(taskId);
    }
    async updateComment(commentId, userId, data) {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) {
            throw new error_1.NotFoundError('Comment');
        }
        // Only comment author can update
        if (comment.authorId !== userId) {
            throw new error_1.ForbiddenError('You can only edit your own comments');
        }
        const updatedComment = await this.commentRepository.update(commentId, data.content);
        // Update mentions - delete old and create new
        await this.commentRepository.deleteMentions(commentId);
        const mentions = this.extractMentions(data.content);
        if (mentions.length > 0) {
            const task = await prisma_1.prisma.task.findUnique({
                where: { id: comment.taskId },
                include: {
                    board: {
                        include: {
                            project: true,
                        },
                    },
                },
            });
            const workspaceId = task?.board.project.workspaceId;
            if (workspaceId) {
                const mentionedUserIds = await this.resolveMentions(mentions, workspaceId);
                for (const mentionedUserId of mentionedUserIds) {
                    await this.commentRepository.createMention(commentId, mentionedUserId, comment.taskId);
                }
            }
        }
        return updatedComment;
    }
    async deleteComment(commentId, userId) {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) {
            throw new error_1.NotFoundError('Comment');
        }
        const userRole = await this.checkTaskAccess(comment.taskId, userId);
        // Author or ADMIN can delete
        if (comment.authorId !== userId && userRole !== prisma_2.Role.ADMIN) {
            throw new error_1.ForbiddenError('You do not have permission to delete this comment');
        }
        await this.commentRepository.deleteMentions(commentId);
        await this.commentRepository.delete(commentId);
    }
}
exports.CommentService = CommentService;
