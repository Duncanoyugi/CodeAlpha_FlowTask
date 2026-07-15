import Spinner from '@components/ui/Spinner';
import { useAdminDashboard } from '@/hooks/useDashboard';
import { usePermissions } from '@/hooks/usePermissions';
import RolePill from '@components/dashboard/RolePill';
import type { Role } from '@constants/roles';
import { Clock3, FolderKanban, ListTodo, Users, MailPlus, Plus } from 'lucide-react';
import ProgressBar from '@components/dashboard/ProgressBar';
import EmptyState from '@components/dashboard/EmptyState';
import type { Priority } from '@/types/dashboard.types';

const priorityColors: Record<Priority, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-rose-100 text-rose-700',
};

export default function AdminDashboard({
  workspaceId,
  currentRole,
}: {
  workspaceId: string;
  currentRole: Role;
}) {
  const { data, isLoading, error } = useAdminDashboard(workspaceId);
  const { canCreateProject } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4 p-6">
        <h1 className="text-xl font-semibold text-slate-900">Admin Dashboard</h1>
        <div className="text-sm text-rose-600">Failed to load dashboard.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Workspace overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
          >
            Export Report
          </button>
          {canCreateProject && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          )}
          <RolePill role={currentRole} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FolderKanban className="h-5 w-5 text-slate-500" />
            <div className="text-xs uppercase tracking-wider text-slate-500">Total Projects</div>
          </div>
          <div className="text-3xl font-semibold text-slate-900">{data.metrics.totalProjects}</div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <ListTodo className="h-5 w-5 text-slate-500" />
            <div className="text-xs uppercase tracking-wider text-slate-500">Active Tasks</div>
          </div>
          <div className="text-3xl font-semibold text-slate-900">{data.metrics.activeTasks}</div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-slate-500" />
            <div className="text-xs uppercase tracking-wider text-slate-500">Team Members</div>
          </div>
          <div className="text-3xl font-semibold text-slate-900">{data.metrics.teamMembers}</div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <MailPlus className="h-5 w-5 text-slate-500" />
            <div className="text-xs uppercase tracking-wider text-slate-500">Pending Invites</div>
          </div>
          <div className="text-3xl font-semibold text-slate-900">{data.metrics.pendingInvites}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl bg-white border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Projects</h2>
          {data.projects.length === 0 ? (
            <EmptyState
              icon={<FolderKanban className="h-6 w-6" />}
              title="No projects yet"
              description="Create a project to get started with your workspace."
            />
          ) : (
            <div className="mt-2 space-y-3">
              {data.projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-900 truncate">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.description ?? 'No description'} • {p.memberCount} members</div>
                    <div className="text-xs text-slate-500 mt-1">{p.taskCount} tasks • {p.completedTasks} completed</div>
                    <ProgressBar value={p.progress} className="mt-2" />
                  </div>
                  <div className="text-xs text-slate-500 ml-4">{p.progress}%</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Priority Distribution</h2>
          {data.priorityDistribution.length === 0 ? (
            <EmptyState
              icon={<ListTodo className="h-6 w-6" />}
              title="No tasks"
              description="Create tasks to see priority distribution."
            />
          ) : (
            <div className="space-y-3">
              {data.priorityDistribution.map((p) => (
                <div key={p.priority} className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${priorityColors[p.priority]}`}>
                    {p.priority}
                  </span>
                  <span className="text-sm text-slate-700">{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl bg-white border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Recent Tasks</h2>
        {data.recentTasks.length === 0 ? (
          <EmptyState
            icon={<ListTodo className="h-6 w-6" />}
            title="No tasks yet"
            description="Create tasks to see them here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left font-medium text-slate-600 pb-2">Task</th>
                  <th className="text-left font-medium text-slate-600 pb-2">Project</th>
                  <th className="text-left font-medium text-slate-600 pb-2">Priority</th>
                  <th className="text-left font-medium text-slate-600 pb-2">Activity</th>
                  <th className="text-left font-medium text-slate-600 pb-2">Assignee</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTasks.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 text-slate-900">{t.title}</td>
                    <td className="py-3 text-slate-600">{t.project?.name ?? '—'}</td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-md ${priorityColors[t.priority]}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">{t.commentCount} comments • {t.attachmentCount} files</td>
                    <td className="py-3 text-slate-600">
                      {t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Recent Activity</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock3 className="h-4 w-4" />
            Workspace feed
          </div>
        </div>
        {data.recentActivity.length === 0 ? (
          <EmptyState
            icon={<Clock3 className="h-6 w-6" />}
            title="No recent activity"
            description="Workspace activity will appear here."
          />
        ) : (
          <div className="space-y-3">
            {data.recentActivity.map((item) => (
              <div key={item.id} className="flex items-start justify-between rounded-xl border border-slate-100 px-3 py-3">
                <div>
                  <div className="text-sm font-medium text-slate-900">{item.actor.firstName} {item.actor.lastName}</div>
                  <div className="text-sm text-slate-600">{item.verb} • {item.target.type}</div>
                </div>
                <div className="text-xs text-slate-500">{item.relativeTime}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}