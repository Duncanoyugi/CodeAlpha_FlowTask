import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { validate } from '../../../src/middleware/validation.middleware';
import { MarkNotificationsReadSchema, NotificationIdSchema } from './notification.schema';
import { authMiddleware } from '../../../src/middleware/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

// All notification routes require authentication
router.use(authMiddleware);

router.get('/', notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.post('/mark-all-read', notificationController.markAllAsRead);
router.post('/mark-read', validate(MarkNotificationsReadSchema), notificationController.markMultipleAsRead);
router.patch('/:notificationId/read', validate(NotificationIdSchema), notificationController.markAsRead);

export default router;