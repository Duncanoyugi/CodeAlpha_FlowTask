import { prisma } from '../lib/prisma';
import logger from '../lib/logger';
import { NotificationService } from '../modules/notifications/notification.service';

const notificationService = new NotificationService();

export const checkDueDates = async () => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find tasks due tomorrow
    const tasksDueTomorrow = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
          lt: new Date(tomorrow.setHours(0, 0, 0, 0)),
        },
        deletedAt: null,
        assigneeId: { not: null },
      },
      include: {
        assignee: true,
        board: {
          include: {
            project: {
              include: {
                workspace: true,
              },
            },
          },
        },
      },
    });
    
    for (const task of tasksDueTomorrow) {
      if (task.assigneeId) {
        await notificationService.notifyDueDateApproaching(
          task.id,
          task.assigneeId,
          task.title,
          task.dueDate!,
        );
        logger.info(`Due date notification sent for task ${task.id}`);
      }
    }
    
    // Find overdue tasks (due yesterday or earlier, not completed)
    const overdueTasks = await prisma.task.findMany({
      where: {
        dueDate: { lt: new Date(today.setHours(0, 0, 0, 0)) },
        deletedAt: null,
        assigneeId: { not: null },
      },
      include: {
        assignee: true,
      },
    });
    
    for (const task of overdueTasks) {
      if (task.assigneeId) {
        await notificationService.createNotification(
          task.assigneeId,
          'DUE_DATE',
          'Task Overdue',
          `Task "${task.title}" is overdue`,
          `/tasks/${task.id}`,
          { taskId: task.id, isOverdue: true },
        );
        logger.info(`Overdue notification sent for task ${task.id}`);
      }
    }
  } catch (error) {
    logger.error('Due date checker error:', error);
  }
};