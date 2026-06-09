import { NotificationRepository } from './notification.repository';
import { NotificationType } from '../../generated/prisma';
import { NotFoundError, ForbiddenError } from '../../../src/utils/error';
import { prisma } from '../../../src/lib/prisma';

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: any,
  ) {
    return this.notificationRepository.create({
      userId,
      type,
      title,
      message,
      actionUrl,
      metadata,
    });
  }

  async getUserNotifications(userId: string) {
    return this.notificationRepository.findAllByUser(userId);
  }

  async getUnreadCount(userId: string) {
    return this.notificationRepository.getUnreadCount(userId);
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findById(notificationId);
    
    if (!notification) {
      throw new NotFoundError('Notification');
    }
    
    if (notification.userId !== userId) {
      throw new ForbiddenError('You do not have permission to access this notification');
    }
    
    return this.notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.markAllAsRead(userId);
  }

  async markMultipleAsRead(notificationIds: string[], userId: string) {
    // Verify all notifications belong to the user
    const notifications = await prisma.notification.findMany({
      where: {
        id: { in: notificationIds },
        userId,
      },
    });
    
    if (notifications.length !== notificationIds.length) {
      throw new ForbiddenError('Some notifications do not belong to you');
    }
    
    await this.notificationRepository.markMultipleAsRead(notificationIds);
  }

  // Convenience methods for common notifications
  async notifyTaskAssigned(taskId: string, assigneeId: string, assignedByName: string, taskTitle: string) {
    return this.createNotification(
      assigneeId,
      NotificationType.TASK_ASSIGNED,
      'Task Assigned',
      `${assignedByName} assigned you to task "${taskTitle}"`,
      `/tasks/${taskId}`,
      { taskId, assignedBy: assignedByName },
    );
  }

  async notifyCommentAdded(taskId: string, taskTitle: string, commentAuthorName: string, taskAssigneeId?: string | null) {
    if (taskAssigneeId) {
      return this.createNotification(
        taskAssigneeId,
        NotificationType.COMMENT_ADDED,
        'New Comment',
        `${commentAuthorName} commented on task "${taskTitle}"`,
        `/tasks/${taskId}`,
        { taskId, commentAuthor: commentAuthorName },
      );
    }
  }

  async notifyMention(taskId: string, mentionedUserId: string, mentionedByName: string, taskTitle: string) {
    return this.createNotification(
      mentionedUserId,
      NotificationType.MENTION,
      'You were mentioned',
      `${mentionedByName} mentioned you in task "${taskTitle}"`,
      `/tasks/${taskId}`,
      { taskId, mentionedBy: mentionedByName },
    );
  }

  async notifyInviteReceived(workspaceId: string, workspaceName: string, invitedBy: string, email: string) {
    return this.createNotification(
      email, // Note: This requires user to exist, handled in invite acceptance
      NotificationType.INVITE_RECEIVED,
      'Workspace Invitation',
      `${invitedBy} invited you to join "${workspaceName}"`,
      `/workspaces/${workspaceId}/accept-invite`,
      { workspaceId, invitedBy },
    );
  }

  async notifyDueDateApproaching(taskId: string, assigneeId: string, taskTitle: string, dueDate: Date) {
    return this.createNotification(
      assigneeId,
      NotificationType.DUE_DATE,
      'Task Due Soon',
      `Task "${taskTitle}" is due on ${dueDate.toLocaleDateString()}`,
      `/tasks/${taskId}`,
      { taskId, dueDate },
    );
  }

  async notifyTaskCompleted(taskId: string, taskTitle: string, completedBy: string, reporterId: string) {
    return this.createNotification(
      reporterId,
      NotificationType.TASK_COMPLETED,
      'Task Completed',
      `${completedBy} completed task "${taskTitle}"`,
      `/tasks/${taskId}`,
      { taskId, completedBy },
    );
  }

  async notifyMemberJoined(workspaceId: string, workspaceName: string, newMemberName: string, adminId: string) {
    return this.createNotification(
      adminId,
      NotificationType.MEMBER_JOINED,
      'New Team Member',
      `${newMemberName} joined workspace "${workspaceName}"`,
      `/workspaces/${workspaceId}/members`,
      { workspaceId, newMember: newMemberName },
    );
  }
}