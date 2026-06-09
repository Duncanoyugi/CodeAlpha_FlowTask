"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("./notification.service");
const http_1 = require("../../../src/constants/http");
const notificationService = new notification_service_1.NotificationService();
class NotificationController {
    async getUserNotifications(req, res, next) {
        try {
            const userId = req.user?.userId;
            const result = await notificationService.getUserNotifications(userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getUnreadCount(req, res, next) {
        try {
            const userId = req.user?.userId;
            const count = await notificationService.getUnreadCount(userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: { unreadCount: count },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async markAsRead(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { notificationId } = req.params;
            await notificationService.markAsRead(notificationId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Notification marked as read',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async markAllAsRead(req, res, next) {
        try {
            const userId = req.user?.userId;
            await notificationService.markAllAsRead(userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'All notifications marked as read',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async markMultipleAsRead(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { notificationIds } = req.body;
            await notificationService.markMultipleAsRead(notificationIds, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Notifications marked as read',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotificationController = NotificationController;
