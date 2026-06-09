import { prisma } from '../../../src/lib/prisma';
import { Activity, EntityType, Action } from '../../generated/prisma';

export class ActivityRepository {
  async create(data: {
    workspaceId: string;
    userId: string;
    entityType: EntityType;
    entityId: string;
    action: Action;
    details?: any;
    projectId?: string;
    taskId?: string;
  }): Promise<Activity> {
    return prisma.activity.create({
      data,
    });
  }

  async findAllByWorkspace(workspaceId: string, limit = 50): Promise<Activity[]> {
    return prisma.activity.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findAllByEntity(entityType: EntityType, entityId: string): Promise<Activity[]> {
    return prisma.activity.findMany({
      where: { entityType, entityId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByTask(taskId: string): Promise<Activity[]> {
    return prisma.activity.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByProject(projectId: string): Promise<Activity[]> {
    return prisma.activity.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}