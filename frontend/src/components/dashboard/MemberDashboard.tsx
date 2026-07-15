import Spinner from '@components/ui/Spinner';
import RolePill from '@components/dashboard/RolePill';
import type { Role } from '@constants/roles';
import { ListTodo, CheckCircle2, FolderKanban, AlertTriangle, Clock3, Plus } from 'lucide-react';
import ProgressBar from '@components/dashboard/ProgressBar';
import EmptyState from '@components/dashboard/EmptyState';
import { useMemberDashboard } from '@/hooks/useDashboard';
import { usePermissions } from '@/hooks/usePermissions';

export default function MemberDashboard({ currentRole }: { currentRole: Role }) {
  const { data, isLoading, error } = useMemberDashboard();
  const { canCreateTask } = usePermissions();

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
        <h1 className="text-xl font-semibold text-slate-900">Member Dashboard</h1>
        <div className="text-sm text-rose-600">Failed to load dashboard.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Member Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back, {data.user.firstName}.</p>
        </div>
        <div className="flex items-center gap-2">
          {canCreateTask && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </button>
          )}
          <RolePill role={currentRole} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <ListTodo className="h-5 w-5 text-slate-500" />
            <div className="text-xs uppercase tracking-wider text-slate-500">Assigned Tasks</div>
          </div>
          <div className="text-3xl font-semibold text-slate-900">{data.assignedTasks.total}</div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="h-5 w-5 text-slate-500" />
            <div className="text-xs uppercase tracking-wider text-slate-500">Completed</div>
          </div>
          <div className="text-3xl font-semibold text-slate-900">{data.assignedTasks.completed}</div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <ListTodo className="h-5 w-5 text-slate-500" />
            <div className="text-xs uppercase tracking-wider text-slate-500">Pending</div>
          </div>
          <div className="text-3xl font-semibold text-slate-900">{data.assignedTasks.pending}</div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <ListTodo className="h-5 w-5 text-slate-500" />
            <div className="text-xs uppercase tracking-wider text-slate-500">Completion Rate</div>
          </div>
          <div className="text-3xl font-semibold text-slate-900">{data.assignedTasks.completionRate}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl bg-white border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Your Projects</h2>
          {data.projects.length === 0 ? (
            <EmptyState
              icon={<FolderKanban className="h-6 w-6" />}
              title="No project membership yet"
              description="You are not assigned to any projects yet."
            />
          ) : (
            <div className="mt-2 space-y-3">
              {data.projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-900 truncate">{p.name}</div>
                    <ProgressBar value={p.progress} className="mt-2" />
                  </div>
                  <div className="text-xs text-slate-500 ml-4">{p.progress}%</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Status Distribution</h2>
          {data.taskStatusDistribution.length === 0 ? (
            <EmptyState
              icon={<ListTodo className="h-6 w-6" />}
              title="No task status history"
              description="Status distribution will appear as tasks are updated."
            />
          ) : (
            <div className="space-y-3">
              {data.taskStatusDistribution.map((s) => (
                <div key={s.status} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">{s.status}</span>
                  <span className="text-sm text-slate-900">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl bg-white border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Urgent Tasks</h2>
        {data.urgentTasks.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle className="h-6 w-6" />}
            title="No urgent work"
            description="You are clear on urgent items right now."
          />
        ) : (
          <div className="space-y-2">
            {data.urgentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3">
                <div className="text-sm text-slate-900">{task.title}</div>
                <div className="text-xs text-slate-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Active Tasks</h2>
        {data.activeTasks.length === 0 ? (
          <EmptyState
            icon={<ListTodo className="h-6 w-6" />}
            title="No active tasks"
            description="Your current work will appear here."
          />
        ) : (
          <div className="space-y-3">
            {data.activeTasks.map((task) => (
              <div key={task.id} className="flex items-start justify-between rounded-xl border border-slate-100 px-3 py-3">
                <div>
                  <div className="text-sm font-medium text-slate-900">{task.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{task.commentCount} comments • {task.labels.length} labels</div>
                </div>
                <div className="text-xs text-slate-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Recently Completed</h2>
        {data.recentCompleted.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="h-6 w-6" />}
            title="No completed tasks"
            description="Complete tasks to see them here."
          />
        ) : (
          <div className="space-y-2">
            {data.recentCompleted.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="text-sm text-slate-900">{t.title}</div>
                <div className="text-xs text-slate-500">
                  {t.completedAt ? new Date(t.completedAt).toLocaleDateString() : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Recent Activity</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock3 className="h-4 w-4" />
            Related to you
          </div>
        </div>
        {data.recentActivity.length === 0 ? (
          <EmptyState
            icon={<Clock3 className="h-6 w-6" />}
            title="No recent activity"
            description="Your recent work will appear here."
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