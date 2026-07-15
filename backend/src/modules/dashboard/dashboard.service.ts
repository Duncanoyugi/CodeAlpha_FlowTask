import { prisma } from '../../lib/prisma';
import type { AdminDashboardResponse, MemberDashboardResponse } from './dashboard.types';
import { calculateCompletionRate, dashboardActivityToRecent } from './dashboard.utils';
import { NotFoundError } from '../../utils/error';

export class DashboardService {

  async getAdminDashboard({
    workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }): Promise<AdminDashboardResponse> {
    const [workspace, projects, boardsCount, tasksAgg, membersAgg, pendingInvites, recentActivities] =
      await Promise.all([
        prisma.workspace.findUnique({
          where: { id: workspaceId },
          select: { id: true, name: true },
        }),
        prisma.project.findMany({
          where: { workspaceId, deletedAt: null },
          select: {
            id: true,
            name: true,
            description: true,
            members: {
              select: { userId: true },
            },
          },
        }),
        prisma.board.count({
          where: { project: { workspaceId } },
        }),
        prisma.task.aggregate({
          _count: { id: true },
          where: { board: { project: { workspaceId } }, deletedAt: null },
        }),
        prisma.workspaceMember.count({ where: { workspaceId } }),
        prisma.invite.count({ where: { workspaceId, acceptedAt: null } }),
        prisma.activity.findMany({
          where: { workspaceId },
          orderBy: { createdAt: 'desc' },
          take: 8,
          select: {
            id: true,
            createdAt: true,
            action: true,
            entityType: true,
            entityId: true,
            projectId: true,
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        }),
      ]);

    if (!workspace) {
      throw new NotFoundError('Workspace');
    }

    const doneTaskIds = await prisma.task.findMany({
      where: {
        deletedAt: null,
        board: { project: { workspaceId } },
        completedAt: { not: null },
      },
      select: { id: true, boardId: true },
    });

    const doneTaskIdSet = new Set(doneTaskIds.map((task) => task.id));
    const totalTasks = tasksAgg._count.id;
    const completedTasks = doneTaskIdSet.size;
    const completionRate = calculateCompletionRate(totalTasks, completedTasks);

    const projectTaskAggregates = await prisma.task.groupBy({
      by: ['boardId'],
      where: {
        deletedAt: null,
        board: { project: { workspaceId } },
      },
      _count: { _all: true },
    });

    const boardToProject = await prisma.board.findMany({
      where: { project: { workspaceId } },
      select: { id: true, projectId: true },
    });
    const boardIdToProjectId = new Map(boardToProject.map((board) => [board.id, board.projectId]));

    const taskCountByProject = new Map<string, number>();
    const completedCountByProject = new Map<string, number>();

    for (const row of projectTaskAggregates as any) {
      const projectId = boardIdToProjectId.get(row.boardId as string);
      if (!projectId) continue;
      const taskCount = row._count?._all ?? 0;
      taskCountByProject.set(projectId, (taskCountByProject.get(projectId) ?? 0) + taskCount);
    }

    for (const task of doneTaskIds) {
      const projectId = boardIdToProjectId.get(task.boardId);
      if (!projectId) continue;
      completedCountByProject.set(projectId, (completedCountByProject.get(projectId) ?? 0) + 1);
    }

    const projectSummaries = projects.map((project) => {
      const taskCount = taskCountByProject.get(project.id) ?? 0;
      const completed = completedCountByProject.get(project.id) ?? 0;
      const progress = taskCount > 0 ? calculateCompletionRate(taskCount, completed) : 0;

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        taskCount,
        completedTasks: completed,
        progress,
        memberCount: project.members.length,
      };
    });

    const priorityDistribution = await prisma.task.groupBy({
      by: ['priority'],
      where: {
        deletedAt: null,
        board: { project: { workspaceId } },
      },
      _count: { _all: true },
    });

    const recentTasks = await prisma.task.findMany({
      where: {
        deletedAt: null,
        board: { project: { workspaceId } },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        title: true,
        priority: true,
        dueDate: true,
        completedAt: true,
        comments: { select: { id: true } },
        attachments: { select: { id: true } },
        labels: {
          select: {
            label: {
              select: { id: true, name: true, color: true },
            },
          },
        },
        assignee: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        board: {
          select: {
            id: true,
            name: true,
            project: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    const metricAvailability = {
      completionVelocity: false,
      burndown: false,
      weekdayPerformance: false,
    };

    return {
      workspace,
      metrics: {
        totalProjects: projects.length,
        totalBoards: boardsCount,
        totalTasks,
        completedTasks,
        completionRate,
        teamMembers: membersAgg,
        pendingInvites,
        activeTasks: totalTasks - completedTasks,
      },
      projects: projectSummaries,
      priorityDistribution: priorityDistribution.map((item: any) => ({
        priority: item.priority,
        count: item._count?._all ?? 0,
      })),
      recentTasks: recentTasks.map((task) => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        completedAt: task.completedAt ? task.completedAt.toISOString() : null,
        commentCount: task.comments.length,
        attachmentCount: task.attachments.length,
        labels: task.labels.map((entry: any) => entry.label),
        assignee: task.assignee
          ? {
              id: task.assignee.id,
              firstName: task.assignee.firstName,
              lastName: task.assignee.lastName,
              avatar: task.assignee.avatar,
            }
          : null,
        board: task.board
          ? {
              id: task.board.id,
              name: task.board.name,
            }
          : null,
        project: task.board?.project
          ? {
              id: task.board.project.id,
              name: task.board.project.name,
            }
          : null,
      })),
      recentActivity: recentActivities.map((activity) => dashboardActivityToRecent(activity)),
      metricAvailability,
    };
  }

  async getMemberDashboard({ userId }: { userId: string }): Promise<MemberDashboardResponse> {
    const [user, assignedAgg, completedAgg, projectMemberships, recentActivities] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, firstName: true, lastName: true, avatar: true },
      }),
      prisma.task.aggregate({
        _count: { id: true },
        where: { assigneeId: userId, deletedAt: null },
      } as any),
      prisma.task.aggregate({
        _count: { id: true },
        where: {
          assigneeId: userId,
          deletedAt: null,
          completedAt: { not: null },
        },
      } as any),
      prisma.projectMember.findMany({
        where: { userId },
        select: { projectId: true, project: { select: { name: true } } },
      }),
      prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          createdAt: true,
          action: true,
          entityType: true,
          entityId: true,
          projectId: true,
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      }),
    ]);

    if (!user) {
      throw new NotFoundError('User');
    }

    const totalAssigned = (assignedAgg as any)?._count?.id ?? 0;
    const totalCompleted = (completedAgg as any)?._count?.id ?? 0;
    const totalPending = totalAssigned - totalCompleted;

    const recentCompletedTasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        deletedAt: null,
        completedAt: { not: null },
      },
      orderBy: { completedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        completedAt: true,
      },
    });

    const activeTasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        deletedAt: null,
        completedAt: null,
      },
      orderBy: { dueDate: 'asc' },
      take: 6,
      select: {
        id: true,
        title: true,
        priority: true,
        dueDate: true,
        comments: { select: { id: true } },
        labels: {
          select: {
            label: {
              select: { id: true, name: true, color: true },
            },
          },
        },
      },
    });

    const urgentTasks = activeTasks.filter((task) => task.priority === 'URGENT' && task.dueDate && task.dueDate <= new Date());

    const statusDistributionAgg = await prisma.taskStatusHistory.groupBy({
      by: ['toStatus'],
      where: {
        task: {
          assigneeId: userId,
          deletedAt: null,
        },
      },
      _count: { _all: true },
    });

    const taskStatusDistribution = statusDistributionAgg.map((status: any) => ({
      status: status.toStatus,
      count: status._count?._all ?? 0,
    }));

    const metricAvailability = {
      completionVelocity: false,
      burndown: false,
      weekdayPerformance: false,
    };

    return {
      user,
      assignedTasks: {
        total: totalAssigned,
        completed: totalCompleted,
        pending: totalPending,
        completionRate: calculateCompletionRate(totalAssigned, totalCompleted),
      },
      urgentTasks: urgentTasks.map((task) => ({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        priority: task.priority,
      })),
      activeTasks: activeTasks.map((task) => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        commentCount: task.comments.length,
        labels: task.labels.map((entry: any) => entry.label),
      })),
      recentCompleted: recentCompletedTasks.map((task) => ({
        id: task.id,
        title: task.title,
        completedAt: task.completedAt ? task.completedAt.toISOString() : null,
      })),
      taskStatusDistribution,
      projects: projectMemberships.map((membership: any) => ({
        id: membership.projectId,
        name: membership.project?.name ?? '',
        progress: 0,
      })),
      recentActivity: recentActivities.map((activity) => dashboardActivityToRecent(activity)),
      metricAvailability,
    };
  }
}

export const dashboardService = new DashboardService();

