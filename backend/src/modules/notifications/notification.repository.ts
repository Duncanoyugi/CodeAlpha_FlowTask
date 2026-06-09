import { prisma } from '../../../src/lib/prisma';
import { Notification, NotificationType } from '../../generated/prisma';

export class NotificationRepository {
  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: any;
  }): Promise<Notification> {
    return prisma.notification.create({
      data,
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  async findAllByUser(userId: string, limit = 50): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
      },
      data: { isRead: true },
    });
  }

  async deleteOldNotifications(daysOld = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        isRead: true,
      },
    });
  }
}