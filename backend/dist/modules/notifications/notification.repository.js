"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const prisma_1 = require("../../../src/lib/prisma");
class NotificationRepository {
    async create(data) {
        return prisma_1.prisma.notification.create({
            data,
        });
    }
    async findById(id) {
        return prisma_1.prisma.notification.findUnique({
            where: { id },
        });
    }
    async findAllByUser(userId, limit = 50) {
        return prisma_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async getUnreadCount(userId) {
        return prisma_1.prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
    }
    async markAsRead(notificationId) {
        return prisma_1.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        await prisma_1.prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: { isRead: true },
        });
    }
    async markMultipleAsRead(notificationIds) {
        await prisma_1.prisma.notification.updateMany({
            where: {
                id: { in: notificationIds },
            },
            data: { isRead: true },
        });
    }
    async deleteOldNotifications(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        await prisma_1.prisma.notification.deleteMany({
            where: {
                createdAt: { lt: cutoffDate },
                isRead: true,
            },
        });
    }
}
exports.NotificationRepository = NotificationRepository;
