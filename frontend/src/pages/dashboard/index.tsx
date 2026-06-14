import type { Activity, Task, Board, Project, Workspace } from '@/types';
import type { Role } from '@constants/roles';
import StatCard from '@components/dashboard/StatCard';
import TaskChart from '@components/dashboard/TaskChart';
import Spinner from '@components/ui/Spinner';
import {
  Eye,
  CheckSquare2,
  Users,
  FolderKanban,
  CheckSquare,
  BellDot,
  BarChart3,
  UserPlus,
  Settings2,
  ShieldCheck,
  LayoutDashboard,
  Clock,
  AlertCircle,
} from 'lucide-react';

export interface RoleDashboardProps {
  workspaces: Workspace[];
  projects: Project[];
  tasks: Task[];
  boards: Board[];
  activities: Activity[];
  unreadCount: number;
  activityLoading: boolean;
  currentRole: Role;
  currentWorkspace: Workspace | null;
  user: any;
}

const safeActivities = (activities: Activity[]) => (Array.isArray(activities) ? activities : []);

const AdminDashboard = ({
  workspaces,
  projects,
  tasks,
  activities,
  unreadCount,
  activityLoading,
  currentRole,
}: RoleDashboardProps) => {
  const pendingReview = tasks.filter((task) => task.status === 'REVIEW').length;
  const items = safeActivities(activities);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Workspace overview and team management</p>
        </div>
        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 capitalize">{currentRole.toLowerCase()}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Workspaces" value={workspaces.length} icon={<Users className="h-5 w-5" />} trend="+1 this month" trendUp />
        <StatCard title="Active Projects" value={projects.length} icon={<FolderKanban className="h-5 w-5" />} color="indigo" />
        <StatCard title="Total Tasks" value={tasks.length} icon={<CheckSquare className="h-5 w-5" />} color="amber" />
        <StatCard title="Pending Review" value={pendingReview} icon={<AlertCircle className="h-5 w-5" />} color="rose" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:border-primary-300 hover:bg-primary-50">
              <UserPlus className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Invite Members</span>
            </button>
            <button className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:border-primary-300 hover:bg-primary-50">
              <FolderKanban className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">New Project</span>
            </button>
            <button className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:border-primary-300 hover:bg-primary-50">
              <ShieldCheck className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Manage Roles</span>
            </button>
            <button className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:border-primary-300 hover:bg-primary-50">
              <LayoutDashboard className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Workspace Settings</span>
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BellDot className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Unread</span>
              <span className="text-sm font-semibold text-gray-900">{unreadCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Tasks</span>
              <span className="text-sm font-semibold text-gray-900">{tasks.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Team Size</span>
              <span className="text-sm font-semibold text-gray-900">-</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <span className="text-xs text-gray-400">Live updates</span>
        </div>
        {activityLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No recent activity.</p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{a.user?.firstName || 'Someone'}</span> {a.action.replace(/_/g, ' ').toLowerCase()}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MemberDashboard = ({
  projects: _projects,
  tasks,
  boards,
  activities,
  unreadCount,
  activityLoading,
  currentRole,
}: RoleDashboardProps) => {
  const myTasks = (tasks ?? []).filter((task) => typeof task.assigneeId === 'string');
  const completedTasks = myTasks.filter((task) => task.status === 'DONE').length;
  const pendingTasks = myTasks.filter((task) => task.status === 'TODO' || task.status === 'IN_PROGRESS').length;
  const inProgress = myTasks.filter((task) => task.status === 'IN_PROGRESS').length;
  const items = safeActivities(activities);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Work</h1>
          <p className="text-gray-500 mt-1">Your assigned tasks and progress</p>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 capitalize">{currentRole.toLowerCase()}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Tasks" value={myTasks.length} icon={<CheckSquare2 className="h-5 w-5" />} subtitle={`${completedTasks} completed`} color="indigo" />
        <StatCard title="In Progress" value={inProgress} icon={<Clock className="h-5 w-5" />} color="blue" />
        <StatCard title="Pending" value={pendingTasks} icon={<AlertCircle className="h-5 w-5" />} color="amber" />
        <StatCard title="Notifications" value={unreadCount} icon={<BellDot className="h-5 w-5" />} trend={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} color="rose" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TaskChart tasks={tasks} boards={boards} />
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <span className="text-xs text-gray-400">Live updates</span>
            </div>
            {activityLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {items.slice(0, 6).map((a) => (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{a.user?.firstName || 'Someone'}</span> {a.action.replace(/_/g, ' ').toLowerCase()}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">{new Date(a.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">My Boards</h3>
          <div className="space-y-3">
            {boards.slice(0, 5).map((board) => (
              <div key={board.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{board.name}</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(board.updatedAt).toLocaleDateString()}</span>
              </div>
            ))}
            {boards.length === 0 && <p className="text-sm text-gray-500">No boards yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewerDashboard = ({
  projects,
  tasks,
  boards,
  activities,
  unreadCount,
  activityLoading,
  currentRole,
}: RoleDashboardProps) => {
  const completedTasks = tasks.filter((task) => task.status === 'DONE').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const items = safeActivities(activities);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-gray-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Overview</h1>
            <p className="text-sm text-gray-500">Read-only view of team progress</p>
          </div>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 capitalize">{currentRole.toLowerCase()}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Projects" value={projects.length} icon={<FolderKanban className="h-5 w-5" />} color="sky" />
        <StatCard title="Total Tasks" value={totalTasks} icon={<CheckSquare className="h-5 w-5" />} color="indigo" />
        <StatCard title="Completion Rate" value={`${completionRate}%`} icon={<CheckSquare2 className="h-5 w-5" />} color="emerald" />
        <StatCard title="Notifications" value={unreadCount} icon={<BellDot className="h-5 w-5" />} trend={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} color="rose" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Project Progress</h3>
          </div>
          <span className="text-xs text-gray-400">Read-only</span>
        </div>
        {projects.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No projects yet.</p>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const projectTasks = tasks.filter((task) => {
                const board = boards.find((b) => b.id === task.boardId);
                return board?.projectId === project.id;
              });
              const done = projectTasks.filter((task) => task.status === 'DONE').length;
              const rate = projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0;
              return (
                <div key={project.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{project.name}</p>
                    <p className="text-xs text-gray-500">
                      {done}/{projectTasks.length} tasks
                    </p>
                  </div>
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${rate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <span className="text-xs text-gray-400">Read-only</span>
        </div>
        {activityLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No recent activity.</p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{a.user?.firstName || 'Someone'}</span> {a.action.replace(/_/g, ' ').toLowerCase()}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { AdminDashboard, MemberDashboard, ViewerDashboard };
