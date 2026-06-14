import type { Activity } from '@/types/activity.types';
import type { Task } from '@/types/task.types';
import type { Board } from '@/types/board.types';
import type { Project } from '@/types/project.types';
import type { Workspace } from '@/types/workspace.types';
import type { Role } from '@constants/roles';
import StatCard from '@components/dashboard/StatCard';
import TaskChart from '@components/dashboard/TaskChart';
import Spinner from '@components/ui/Spinner';
import {
  Users,
  FolderKanban,
  CheckSquare,
  BellDot,
  BarChart3,
} from 'lucide-react';

export interface ProjectDashboardViewProps {
  isDemoMode?: boolean;
  canViewCharts?: boolean;
  canViewActivityLogs?: boolean;
  workspaces?: Workspace[];
  projects?: Project[];
  tasks?: Task[];
  boards?: Board[];
  activities?: Activity[];
  unreadCount?: number;
  activityLoading?: boolean;
  currentRole?: Role | null;
  currentWorkspace?: Workspace | null;
  user?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}

const DEMO_ACTIVITIES = [
  'completed task "Update landing copy"',
  'moved "Fix auth bug" to Review',
  'added 3 new tasks to Sprint 24',
  'commented on "API integration"',
  'closed project "Website Redesign"',
  'updated "Mobile App" settings',
];

const DEMO_BOARDS: Board[] = [
  { id: 'demo-b1', name: 'Website Redesign', projectId: 'p1', workspaceId: 'ws1', createdBy: 'u1', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'demo-b2', name: 'Mobile App', projectId: 'p2', workspaceId: 'ws1', createdBy: 'u1', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'demo-b3', name: 'API Integration', projectId: 'p3', workspaceId: 'ws1', createdBy: 'u1', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'demo-b4', name: 'Marketing', projectId: 'p4', workspaceId: 'ws1', createdBy: 'u1', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
];

const DEMO_TASKS: Task[] = (() => {
  const tasks: Task[] = [];
  const statuses: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
  const priorities: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  for (let i = 0; i < 38; i++) {
    tasks.push({
      id: `demo-t${i}`,
      boardId: DEMO_BOARDS[i % DEMO_BOARDS.length].id,
      columnId: `c${i % 3}`,
      title: `Demo task ${i + 1}`,
      description: null,
      position: i,
      priority: priorities[i % priorities.length],
      status: statuses[Math.floor(i / 10)],
      dueDate: '2025-02-01',
      reporterId: 'u1',
      assigneeId: `u${(i % 4) + 1}`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
      deletedAt: null,
      reporter: { id: 'u1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', avatar: null },
      assignee: { id: `u${(i % 4) + 1}`, firstName: ['Jane', 'Mike', 'Sara', 'Alex'][i % 4], lastName: ['Smith', 'Lee', 'Patel', 'Kim'][i % 4], email: `user${i}@example.com`, avatar: null },
      _count: { comments: i % 5, attachments: i % 3 },
    });
  }
  return tasks;
})();

const DEMO_ACTIVITY_LIST: Activity[] = DEMO_ACTIVITIES.map((action, idx) => ({
  id: `demo-a${idx}`,
  action,
  userId: `u${(idx % 4) + 1}`,
  user: {
    id: `u${(idx % 4) + 1}`,
    firstName: ['John', 'Jane', 'Mike', 'Sara'][idx % 4],
    lastName: ['Doe', 'Smith', 'Lee', 'Patel'][idx % 4],
  },
  createdAt: new Date(Date.now() - idx * 3600000).toISOString(),
}));

const DEMO_WORKSPACES: Workspace[] = [
  { id: 'ws1', name: 'Acme Inc', slug: 'acme-inc', description: null, logo: null, ownerId: 'u1', role: 'ADMIN', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
];

const DEMO_PROJECTS: Project[] = [
  { id: 'p1', name: 'Website Redesign', description: null, color: '#4F46E5', workspaceId: 'ws1', ownerId: 'u1', endDate: null, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z', _count: { boards: 4 } },
  { id: 'p2', name: 'Mobile App', description: null, color: '#2563EB', workspaceId: 'ws1', ownerId: 'u1', endDate: null, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z', _count: { boards: 3 } },
  { id: 'p3', name: 'API Integration', description: null, color: '#059669', workspaceId: 'ws1', ownerId: 'u1', endDate: null, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z', _count: { boards: 2 } },
  { id: 'p4', name: 'Marketing', description: null, color: '#DC2626', workspaceId: 'ws1', ownerId: 'u1', endDate: null, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z', _count: { boards: 1 } },
];

const ProjectDashboardView = ({
  isDemoMode = false,
  canViewCharts = true,
  canViewActivityLogs = true,
  workspaces = [],
  projects = [],
  tasks = [],
  boards = [],
  activities = [],
  unreadCount = 0,
  activityLoading = false,
}: ProjectDashboardViewProps) => {
  const completedTasks = tasks.filter((t) =>
    Object.prototype.hasOwnProperty.call(t, 'status') && (t as { status?: string }).status === 'DONE'
  ).length;
  const pendingTasks = tasks.length - completedTasks;

  const displayTasks = isDemoMode ? DEMO_TASKS : tasks;
  const displayBoards = isDemoMode ? DEMO_BOARDS : boards;
  const displayActivities = isDemoMode ? DEMO_ACTIVITY_LIST : activities;
  const displayWorkspaces = isDemoMode ? DEMO_WORKSPACES : workspaces;
  const displayProjects = isDemoMode ? DEMO_PROJECTS : projects;
  const displayUnread = isDemoMode ? 3 : unreadCount;

  return (
    <div className="space-y-6">
      {isDemoMode && (
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Project Management Made Simple</h1>
          <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
            TaskFlow helps teams plan, track, and deliver amazing work together.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Workspaces"
          value={displayWorkspaces.length}
          icon={<Users className="h-5 w-5" />}
          trend={isDemoMode ? `${displayWorkspaces.length} active` : '+1 this month'}
        />
        <StatCard
          label="Active Projects"
          value={displayProjects.length}
          icon={<FolderKanban className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Tasks"
          value={isDemoMode ? 16 : pendingTasks}
          icon={<CheckSquare className="h-5 w-5" />}
          trend={`${isDemoMode ? 22 : completedTasks} completed`}
        />
        <StatCard
          label="Notifications"
          value={displayUnread}
          icon={<BellDot className="h-5 w-5" />}
          trend={displayUnread > 0 ? `${displayUnread} unread` : 'All caught up'}
        />
      </div>

      {canViewCharts && (
        <TaskChart tasks={displayTasks} boards={displayBoards} />
      )}

      {canViewActivityLogs && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <span className="text-xs text-gray-400">Live updates</span>
          </div>
          {activityLoading && !isDemoMode ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : displayActivities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {displayActivities.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{a.user?.firstName || 'Someone'}</span>{' '}
                      {(isDemoMode ? a.action.replace(/_/g, ' ') : a.action.replace(/_/g, ' ').toLowerCase())}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isDemoMode ? 'A few hours ago' : new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDashboardView;
