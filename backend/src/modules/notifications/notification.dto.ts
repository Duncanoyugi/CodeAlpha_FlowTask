import { NotificationType } from '../../generated/prisma';

export interface NotificationResponseDto {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl: string | null;
  metadata: any;
  createdAt: Date;
}

export interface MarkNotificationsReadDto {
  notificationIds?: string[]; // If empty, mark all as read
}