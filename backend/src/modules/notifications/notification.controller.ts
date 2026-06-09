import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { HttpStatus } from '../../../src/constants/http';

const notificationService = new NotificationService();

export class NotificationController {
  async getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const result = await notificationService.getUserNotifications(userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const count = await notificationService.getUnreadCount(userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: { unreadCount: count },
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { notificationId } = req.params as { notificationId: string };
      await notificationService.markAsRead(notificationId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      await notificationService.markAllAsRead(userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async markMultipleAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { notificationIds } = req.body;
      await notificationService.markMultipleAsRead(notificationIds, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }
}