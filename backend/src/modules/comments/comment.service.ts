import { CommentRepository } from './comment.repository';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';
import { NotFoundError, ForbiddenError } from '../../../src/utils/error';
import { prisma } from '../../../src/lib/prisma';
import { Role } from '../../generated/prisma';
import { resolveTaskAccess } from '../../../src/permissions/access-resolver';

export class CommentService {
  private commentRepository: CommentRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = content.matchAll(mentionRegex);
    const mentions = new Set<string>();

    for (const match of matches) {
      mentions.add(match[1]);
    }

    return Array.from(mentions);
  }

  private async resolveMentions(usernames: string[], workspaceId: string): Promise<string[]> {
    // Find users by firstName or email that match the mention
    const users = await prisma.workspaceMember.findMany({
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

  async createComment(
    taskId: string,
    userId: string,
    data: CreateCommentDto,
  ) {
    await resolveTaskAccess(taskId, userId);

    const comment = await this.commentRepository.create({
      taskId,
      authorId: userId,
      content: data.content,
    });

    // Extract and create mentions
    const mentions = this.extractMentions(data.content);
    if (mentions.length > 0) {
      // Get workspace ID for mention resolution
      const task = await prisma.task.findUnique({
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
          const author = await prisma.user.findUnique({
            where: { id: userId },
            select: { firstName: true, lastName: true },
          });
          await prisma.notification.create({
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

  async getCommentById(commentId: string, userId: string) {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment');
    }

    await resolveTaskAccess(comment.taskId, userId);
    
    return comment;
  }

  async getTaskComments(taskId: string, userId: string) {
    await resolveTaskAccess(taskId, userId);
    return this.commentRepository.findAllByTask(taskId);
  }

  async updateComment(commentId: string, userId: string, data: UpdateCommentDto) {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment');
    }

    const access = await resolveTaskAccess(comment.taskId, userId);

    if (comment.authorId !== userId && access.permissionRole !== Role.ADMIN) {
      throw new ForbiddenError('You do not have permission to edit this comment');
    }

    const updatedComment = await this.commentRepository.update(commentId, data.content);

    // Update mentions - delete old and create new
    await this.commentRepository.deleteMentions(commentId);
    
    const mentions = this.extractMentions(data.content);
    if (mentions.length > 0) {
      const task = await prisma.task.findUnique({
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

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment');
    }

    const access = await resolveTaskAccess(comment.taskId, userId);

    if (comment.authorId !== userId && access.permissionRole !== Role.ADMIN) {
      throw new ForbiddenError('You do not have permission to delete this comment');
    }

    await this.commentRepository.deleteMentions(commentId);
    await this.commentRepository.delete(commentId);
  }
}