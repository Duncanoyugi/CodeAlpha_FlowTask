"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notification_repository_1 = require("./notification.repository");
const prisma_1 = require("../../generated/prisma");
const error_1 = require("../../../src/utils/error");
const prisma_2 = require("../../../src/lib/prisma");
class NotificationService {
    notificationRepository;
    constructor() {
        this.notificationRepository = new notification_repository_1.NotificationRepository();
    }
    async createNotification(userId, type, title, message, actionUrl, metadata) {
        return this.notificationRepository.create({
            userId,
            type,
            title,
            message,
            actionUrl,
            metadata,
        });
    }
    async getUserNotifications(userId) {
        return this.notificationRepository.findAllByUser(userId);
    }
    async getUnreadCount(userId) {
        return this.notificationRepository.getUnreadCount(userId);
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.notificationRepository.findById(notificationId);
        if (!notification) {
            throw new error_1.NotFoundError('Notification');
        }
        if (notification.userId !== userId) {
            throw new error_1.ForbiddenError('You do not have permission to access this notification');
        }
        return this.notificationRepository.markAsRead(notificationId);
    }
    async markAllAsRead(userId) {
        await this.notificationRepository.markAllAsRead(userId);
    }
    async markMultipleAsRead(notificationIds, userId) {
        // Verify all notifications belong to the user
        const notifications = await prisma_2.prisma.notification.findMany({
            where: {
                id: { in: notificationIds },
                userId,
            },
        });
        if (notifications.length !== notificationIds.length) {
            throw new error_1.ForbiddenError('Some notifications do not belong to you');
        }
        await this.notificationRepository.markMultipleAsRead(notificationIds);
    }
    // Convenience methods for common notifications
    async notifyTaskAssigned(taskId, assigneeId, assignedByName, taskTitle) {
        return this.createNotification(assigneeId, prisma_1.NotificationType.TASK_ASSIGNED, 'Task Assigned', `${assignedByName} assigned you to task "${taskTitle}"`, `/tasks/${taskId}`, { taskId, assignedBy: assignedByName });
    }
    async notifyCommentAdded(taskId, taskTitle, commentAuthorName, taskAssigneeId) {
        if (taskAssigneeId) {
            return this.createNotification(taskAssigneeId, prisma_1.NotificationType.COMMENT_ADDED, 'New Comment', `${commentAuthorName} commented on task "${taskTitle}"`, `/tasks/${taskId}`, { taskId, commentAuthor: commentAuthorName });
        }
    }
    async notifyMention(taskId, mentionedUserId, mentionedByName, taskTitle) {
        return this.createNotification(mentionedUserId, prisma_1.NotificationType.MENTION, 'You were mentioned', `${mentionedByName} mentioned you in task "${taskTitle}"`, `/tasks/${taskId}`, { taskId, mentionedBy: mentionedByName });
    }
    async notifyInviteReceived(workspaceId, workspaceName, invitedBy, email) {
        return this.createNotification(email, // Note: This requires user to exist, handled in invite acceptance
        prisma_1.NotificationType.INVITE_RECEIVED, 'Workspace Invitation', `${invitedBy} invited you to join "${workspaceName}"`, `/workspaces/${workspaceId}/accept-invite`, { workspaceId, invitedBy });
    }
    async notifyDueDateApproaching(taskId, assigneeId, taskTitle, dueDate) {
        return this.createNotification(assigneeId, prisma_1.NotificationType.DUE_DATE, 'Task Due Soon', `Task "${taskTitle}" is due on ${dueDate.toLocaleDateString()}`, `/tasks/${taskId}`, { taskId, dueDate });
    }
    async notifyTaskCompleted(taskId, taskTitle, completedBy, reporterId) {
        return this.createNotification(reporterId, prisma_1.NotificationType.TASK_COMPLETED, 'Task Completed', `${completedBy} completed task "${taskTitle}"`, `/tasks/${taskId}`, { taskId, completedBy });
    }
    async notifyMemberJoined(workspaceId, workspaceName, newMemberName, adminId) {
        return this.createNotification(adminId, prisma_1.NotificationType.MEMBER_JOINED, 'New Team Member', `${newMemberName} joined workspace "${workspaceName}"`, `/workspaces/${workspaceId}/members`, { workspaceId, newMember: newMemberName });
    }
}
exports.NotificationService = NotificationService;
