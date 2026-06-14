import { prisma } from '../../lib/prisma';
import { Prisma } from '../../generated/prisma';
import { ForbiddenError } from '../../utils/error';
import { assertProjectAccess } from '../../permissions/project-access.permissions';

export class SearchService {
  private async getAccessibleProjectIds(workspaceId: string, userId: string): Promise<string[]> {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenError('You do not have access to this workspace');
    }

    const restrictedProjects = await prisma.projectMember.findMany({
      where: { project: { workspaceId } },
      select: { projectId: true },
      distinct: ['projectId'],
    });

    const restrictedProjectIds = restrictedProjects.map((projectMember) => projectMember.projectId);
    if (restrictedProjectIds.length === 0) {
      return [];
    }

    const accessibleProjectIds: string[] = [];
    for (const projectId of restrictedProjectIds) {
      try {
        await assertProjectAccess(projectId, userId);
        accessibleProjectIds.push(projectId);
      } catch {
        // Project is restricted and user is not a project member.
      }
    }

    return accessibleProjectIds;
  }

  async searchGlobal(workspaceId: string, query: string, userId: string) {
    // Verify user has access to workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
    
    if (!member) {
      throw new Error('Access denied');
    }

    const accessibleProjectIds = await this.getAccessibleProjectIds(workspaceId, userId);
    
    const searchTerm = `%${query}%`;
    
    // Search tasks
    const tasks = await prisma.task.findMany({
      where: {
        board: {
          project: {
            workspaceId,
            ...(accessibleProjectIds.length > 0 ? { id: { in: accessibleProjectIds } } : {}),
          },
        },
        deletedAt: null,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        board: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        column: true,
      },
      take: 20,
    });
    
    // Search projects
    const projects = await prisma.project.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        ...(accessibleProjectIds.length > 0 ? { id: { in: accessibleProjectIds } } : {}),
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        boards: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 10,
    });
    
    // Search comments
    const comments = await prisma.comment.findMany({
      where: {
        task: {
          board: {
            project: {
              workspaceId,
              ...(accessibleProjectIds.length > 0 ? { id: { in: accessibleProjectIds } } : {}),
            },
          },
        },
        content: { contains: query, mode: 'insensitive' },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      take: 10,
    });
    
    // Search users in workspace
    const users = await prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        OR: [
          { user: { firstName: { contains: query, mode: 'insensitive' } } },
          { user: { lastName: { contains: query, mode: 'insensitive' } } },
          { user: { email: { contains: query, mode: 'insensitive' } } },
        ],
      },
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
      take: 10,
    });
    
    return {
      tasks,
      projects,
      comments,
      users: users.map(m => m.user),
    };
  }
  
  async searchTasks(workspaceId: string, filters: {
    query?: string;
    assigneeId?: string;
    priority?: string;
    status?: string;
    dueDateFrom?: Date;
    dueDateTo?: Date;
  }, userId: string) {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
    
    if (!member) {
      throw new Error('Access denied');
    }

    const accessibleProjectIds = await this.getAccessibleProjectIds(workspaceId, userId);
    
    const where: any = {
      board: {
        project: {
          workspaceId,
          ...(accessibleProjectIds.length > 0 ? { id: { in: accessibleProjectIds } } : {}),
        },
      },
      deletedAt: null,
    };
    
    if (filters.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
      ];
    }
    
    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }
    
    if (filters.priority) {
      where.priority = filters.priority;
    }
    
    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) where.dueDate.gte = filters.dueDateFrom;
      if (filters.dueDateTo) where.dueDate.lte = filters.dueDateTo;
    }
    
    return prisma.task.findMany({
      where,
      include: {
        board: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        column: true,
        labels: {
          include: {
            label: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}