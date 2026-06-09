"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationIdSchema = exports.MarkNotificationsReadSchema = void 0;
const zod_1 = require("zod");
exports.MarkNotificationsReadSchema = zod_1.z.object({
    body: zod_1.z.object({
        notificationIds: zod_1.z.array(zod_1.z.string().cuid()).optional(),
    }),
});
exports.NotificationIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        notificationId: zod_1.z.string().cuid(),
    }),
});
