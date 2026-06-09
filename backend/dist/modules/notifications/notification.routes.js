"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const validation_middleware_1 = require("../../../src/middleware/validation.middleware");
const notification_schema_1 = require("./notification.schema");
const auth_middleware_1 = require("../../../src/middleware/auth.middleware");
const router = (0, express_1.Router)();
const notificationController = new notification_controller_1.NotificationController();
// All notification routes require authentication
router.use(auth_middleware_1.authMiddleware);
router.get('/', notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.post('/mark-all-read', notificationController.markAllAsRead);
router.post('/mark-read', (0, validation_middleware_1.validate)(notification_schema_1.MarkNotificationsReadSchema), notificationController.markMultipleAsRead);
router.patch('/:notificationId/read', (0, validation_middleware_1.validate)(notification_schema_1.NotificationIdSchema), notificationController.markAsRead);
exports.default = router;
