import type { Priority } from '../../generated/prisma';

export interface MetricAvailability {
  completionVelocity: boolean;
  burndown: boolean;
  weekdayPerformance: boolean;
}

export interface DashboardActivityItem {
  id: string;
  createdAt: string;
  actor: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
  verb: string;
  target: {
    type: string;
    id?: string;
    label?: string;
  };
  relativeTime: string;
}

export interface AdminDashboardResponse {
  workspace: {
    id: string;
    name: string;
  };

  metrics: {
    totalProjects: number;
    totalBoards: number;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    teamMembers: number;
    pendingInvites: number;
    activeTasks: number;
  };

  projects: Array<{
    id: string;
    name: string;
    description?: string | null;
    taskCount: number;
    completedTasks: number;
    progress: number;
    memberCount: number;
  }>;

  priorityDistribution: Array<{
    priority: Priority;
    count: number;
  }>;

  recentTasks: Array<{
    id: string;
    title: string;
    priority: Priority;
    dueDate: string | null;
    commentCount: number;
    attachmentCount: number;
    labels: Array<{ id: string; name: string; color: string }>;
    assignee: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string | null;
    } | null;
  }>;

  recentActivity: DashboardActivityItem[];
  metricAvailability: MetricAvailability;
}

export interface MemberDashboardResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };

  assignedTasks: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  };

  urgentTasks: Array<{
    id: string;
    title: string;
    dueDate: string | null;
    priority: Priority;
  }>;

  activeTasks: Array<{
    id: string;
    title: string;
    priority: Priority;
    dueDate: string | null;
    commentCount: number;
    labels: Array<{ id: string; name: string; color: string }>;
  }>;

  recentCompleted: Array<{
    id: string;
    title: string;
    completedAt: string | null;
  }>;

  taskStatusDistribution: Array<{
    status: string;
    count: number;
  }>;

  projects: Array<{
    id: string;
    name: string;
    progress: number;
  }>;

  recentActivity: DashboardActivityItem[];
  metricAvailability: MetricAvailability;
}

