import { prisma } from '../../../src/lib/prisma';
import { Comment } from '../../generated/prisma';

export class CommentRepository {
  async create(data: {
    taskId: string;
    authorId: string;
    content: string;
  }): Promise<Comment> {
    return prisma.comment.create({
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

  async findById(id: string): Promise<Comment | null> {
    return prisma.comment.findUnique({
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

  async findAllByTask(taskId: string): Promise<Comment[]> {
    return prisma.comment.findMany({
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

  async update(id: string, content: string): Promise<Comment> {
    return prisma.comment.update({
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

  async delete(id: string): Promise<void> {
    await prisma.comment.delete({
      where: { id },
    });
  }

  async createMention(commentId: string, userId: string, taskId: string): Promise<void> {
    await prisma.commentMention.create({
      data: {
        commentId,
        userId,
        taskId,
      },
    });
  }

  async deleteMentions(commentId: string): Promise<void> {
    await prisma.commentMention.deleteMany({
      where: { commentId },
    });
  }

  async getTaskId(commentId: string): Promise<string | null> {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { taskId: true },
    });
    return comment?.taskId || null;
  }
}