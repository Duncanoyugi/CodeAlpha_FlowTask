import { z } from 'zod';

export const MarkNotificationsReadSchema = z.object({
  body: z.object({
    notificationIds: z.array(z.string().cuid()).optional(),
  }),
});

export const NotificationIdSchema = z.object({
  params: z.object({
    notificationId: z.string().cuid(),
  }),
});