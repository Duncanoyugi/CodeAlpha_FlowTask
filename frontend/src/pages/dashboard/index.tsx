import type { Activity, Task, Board, Project, Workspace } from '@/types';
import type { Role } from '@constants/roles';
import { useMemo } from 'react';
import {
  AlertCircle,
  BarChart3,
  BellDot,
  CheckCircle2,
  CheckSquare2,
  Clock,
  Eye,
  FolderKanban,
  LayoutDashboard,
  ShieldCheck,
  Users,
  UserPlus,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';

import StatCard from '@components/dashboard/StatCard';
import ProgressBar from '@components/dashboard/ProgressBar';
import ActivityFeed from '@components/dashboard/ActivityFeed';
import EmptyState from '@components/dashboard/EmptyState';
import RolePill from '@components/dashboard/RolePill';

import { cn } from '@utils/cn';


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

const safeArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);



const StatusStack = ({
  todo,
  inProgress,
  review,
  done,
}: {
  todo: number;
  inProgress: number;
  review: number;
  done: number;
}) => {
  const total = todo + inProgress + review + done;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <div className="h-3 flex rounded-full overflow-hidden bg-slate-100">
      <div className="h-full bg-slate-300" style={{ width: `${pct(todo)}%` }} />
      <div className="h-full bg-sky-500" style={{ width: `${pct(inProgress)}%` }} />
      <div className="h-full bg-amber-400" style={{ width: `${pct(review)}%` }} />
      <div className="h-full bg-emerald-500" style={{ width: `${pct(done)}%` }} />
    </div>
  );
};

const AdminDashboard = ({
  projects,
  tasks,
  activities,
  unreadCount,
  activityLoading,
  currentRole,
}: RoleDashboardProps) => {
  const tasksSafe = safeArray<Task>(tasks);
  const projectsSafe = safeArray<Project>(projects);
  const membersCount = useMemo(() => {
    // DashboardPage already passes members in current codebase; however current props don't include members.
    // Best effort: show derived estimate from activities.
    // Keeping it deterministic and safe.
    const ids = new Set<string>();
    for (const a of safeArray<Activity>(activities)) {
      const id = (a as any)?.user?.id;
      if (typeof id === 'string' && id) ids.add(id);
    }
    return ids.size || 0;
  }, [activities]);

  const pendingReview = useMemo(
    () => tasksSafe.filter((t) => t.status === 'REVIEW').length,
    [tasksSafe]
  );

  const activeTasks = useMemo(() => tasksSafe.filter((t) => t.status !== 'DONE').length, [tasksSafe]);

  const velocity7 = useMemo(() => {
    // 7-day done count (best-effort using createdAt)
    const days = Array.from({ length: 7 }).map((_, idx) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - idx));
      day.setHours(0, 0, 0, 0);
      return day;
    });

    const points = days.map((day) => {
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      return tasksSafe.filter((t) => {
        if (t.status !== 'DONE') return false;
        const created = t.createdAt ? new Date(t.createdAt) : null;
        if (!created) return false;
        return created >= day && created < next;
      }).length;
    });

      const max = Math.max(1, ...points);
    const normalized = points.map((p) => p / max);

    // SVG sparkline path
    const w = 180;
    const h = 44;
    const pad = 6;
    const step = w / (normalized.length - 1);
    const d = normalized
      .map((v, i) => {
        const x = i * step;
        const y = h - pad - v * (h - pad * 2);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');

    const area = `${d} L ${w} ${h - pad} L 0 ${h - pad} Z`;

    return { points, d, area };
  }, [tasksSafe]);

  const doneTotal = useMemo(() => tasksSafe.filter((t) => t.status === 'DONE').length, [tasksSafe]);

  const distribution = useMemo(() => {
    const todo = tasksSafe.filter((t) => t.status === 'TODO').length;
    const inProgress = tasksSafe.filter((t) => t.status === 'IN_PROGRESS').length;
    const review = tasksSafe.filter((t) => t.status === 'REVIEW').length;
    const done = tasksSafe.filter((t) => t.status === 'DONE').length;
    return { todo, inProgress, review, done };
  }, [tasksSafe]);

  void currentRole;



  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Workspace overview and team management</h1>
          <p className="text-sm text-slate-500 mt-1">Sprint-level visibility with production-ready UX.</p>
        </div>
        <RolePill role={currentRole} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Projects"
          value={projectsSafe.length}
          icon={<FolderKanban className="h-5 w-5" />}
          tone="accent"
        />
        <StatCard
          label="Active Tasks"
          value={activeTasks}
          icon={<CheckSquare2 className="h-5 w-5" />}
          trendDirection="up"
          trend={pendingReview > 0 ? 'Review in progress' : undefined}
        />
        <StatCard
          label="Team Members"
          value={membersCount}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Review"
          value={pendingReview}
          icon={<AlertCircle className="h-5 w-5" />}
          trendDirection="down"
          trend={pendingReview > 0 ? `+${pendingReview} items` : undefined}
          tone={pendingReview > 0 ? 'dark' : 'default'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <section className="rounded-2xl bg-slate-900 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300">Sprint 7-day velocity</div>
                <h2 className="mt-1 text-lg font-semibold">Done work trend</h2>
              </div>
              <div className="inline-flex items-center gap-2 text-emerald-300">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">{doneTotal > 0 ? '+X%' : 'Stable'}</span>
              </div>
            </div>
            <div className="mt-4">
              <svg width="100%" viewBox="0 0 180 44" aria-hidden="true">
                <path d={velocity7.area} fill="rgb(14 165 233 / 0.08)" stroke="none" />
                <path d={velocity7.d} fill="none" stroke="rgb(14 165 233)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </div>
          </section>

          <section className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-slate-500" />
                <h3 className="font-semibold text-slate-900">Project progress</h3>
              </div>
            </div>
            {projectsSafe.length === 0 ? (
              <EmptyState
                icon={<FolderKanban className="h-5 w-5" />}
                title="Create your first project"
                description="Start tracking work with clear boards and measurable progress."
                action={null}
              />
            ) : (
              <div className="space-y-4">
                {projectsSafe.slice(0, 5).map((p) => {
                  // Best effort without extra wiring: only totals from tasks by project are hard in current code.
                  // Keep UI consistent with real progress once boards/tasks wiring is available.
                  const total = tasksSafe.length;
                  const done = tasksSafe.filter((t) => t.status === 'DONE').length;
                  return (
                    <div key={p.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                          <p className="text-xs text-slate-500">{done}/{total} tasks</p>
                        </div>
                        <div className="text-xs text-slate-500 tabular-nums">
                          {total > 0 ? Math.round((done / total) * 100) : 0}%
                        </div>
                      </div>
                      <ProgressBar value={done} max={Math.max(1, total)} tone="accent" />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-slate-500" />
                <h3 className="font-semibold text-slate-900">Task distribution</h3>
              </div>
            </div>
            <div className="mt-4">
              <StatusStack
                todo={distribution.todo}
                inProgress={distribution.inProgress}
                review={distribution.review}
                done={distribution.done}
              />
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-300" /> TODO</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500" /> IN_PROGRESS</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400" /> REVIEW</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> DONE</div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-slate-500" />
              <h3 className="font-semibold text-slate-900">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="h-10 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-slate-700" type="button">
                <UserPlus className="h-4 w-4" /> Invite Members
              </button>
              <button className="h-10 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-slate-700" type="button">
                <FolderKanban className="h-4 w-4" /> New Project
              </button>
              <button className="h-10 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-slate-700" type="button">
                <ShieldCheck className="h-4 w-4" /> Manage Roles
              </button>
              <button className="h-10 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-slate-700" type="button">
                <LayoutDashboard className="h-4 w-4" /> Workspace Settings
              </button>
            </div>
          </section>

          <section className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BellDot className="h-5 w-5 text-slate-500" />
                <h3 className="font-semibold text-slate-900">Notifications</h3>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Unread</span>
                <span className="text-sm font-semibold text-slate-900 tabular-nums">{unreadCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total tasks</span>
                <span className="text-sm font-semibold text-slate-900 tabular-nums">{tasksSafe.length}</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-500" />
                <h3 className="font-semibold text-slate-900">Activity</h3>
              </div>
              <span className="text-xs text-slate-400">Live</span>
            </div>
            <ActivityFeed activities={activities} isLoading={activityLoading} limit={8} emptyLabel="No recent activity" />
          </section>
        </div>
      </div>
    </div>
  );
};

const MemberDashboard = ({
  tasks,
  boards,
  activities,
  unreadCount,
  activityLoading,
  currentRole,
  user,
}: RoleDashboardProps) => {
  const tasksSafe = safeArray<Task>(tasks);
  const boardsSafe = safeArray<Board>(boards);

  const myTasks = useMemo(() => {
    const uid = user?.id;
    if (!uid) return [];
    return tasksSafe.filter((t) => (t as any)?.assigneeId === uid);
  }, [tasksSafe, user]);

  const inProgress = myTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const done = myTasks.filter((t) => t.status === 'DONE').length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Your assigned tasks and progress</h1>
          <p className="text-sm text-slate-500 mt-1">Stay focused. Ship consistently.</p>
        </div>
        <RolePill role={currentRole} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard tone="accent" label="My Tasks" value={myTasks.length} icon={<CheckSquare2 className="h-5 w-5" />} />
        <StatCard label="In Progress" value={inProgress} icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Completed" value={done} icon={<CheckCircle2 className="h-5 w-5" />} trend={myTasks.length ? `${done} done` : undefined} />
        <StatCard label="Notifications" value={unreadCount} icon={<BellDot className="h-5 w-5" />} trend={unreadCount > 0 ? `${unreadCount} unread` : undefined} trendDirection="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <section className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-slate-500" />
                <h3 className="font-semibold text-slate-900">Today's Focus</h3>
              </div>
            </div>
            {myTasks.length === 0 ? (
              <EmptyState icon={<Clock className="h-5 w-5" />} title="No assigned tasks" description="When tasks are assigned to you, they’ll appear here." />
            ) : (
              <div className="space-y-3">
                {myTasks
                  .filter((t) => t.status !== 'DONE')
                  .slice(0, 5)
                  .sort((a, b) => new Date((a as any).dueDate ?? '2099-01-01').getTime() - new Date((b as any).dueDate ?? '2099-01-01').getTime())
                  .map((t) => {
                    const due = (t as any).dueDate ? new Date((t as any).dueDate) : null;
                    const now = new Date();
                    const diffDays = due ? Math.ceil((due.getTime() - now.getTime()) / 86400000) : 999;
                    const dueTone = diffDays < 0 ? 'bg-rose-500' : diffDays <= 2 ? 'bg-amber-500' : 'bg-slate-500';
                    return (
                      <div key={t.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={cn('h-2 w-2 rounded-full', (t as any).status === 'IN_PROGRESS' ? 'bg-sky-500' : (t as any).status === 'REVIEW' ? 'bg-amber-400' : 'bg-slate-300')} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{(t as any).title ?? 'Untitled'}</p>
                            <p className="text-xs text-slate-500">Due {due ? due.toLocaleDateString() : '—'}</p>
                          </div>
                        </div>
                        <div className="h-2 w-20 rounded-full bg-slate-100 overflow-hidden">
                          <div className={cn('h-full rounded-full', dueTone)} style={{ width: `${Math.min(100, Math.max(0, diffDays <= 0 ? 100 : 20))}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-500" />
                <h3 className="font-semibold text-slate-900">Activity</h3>
              </div>
            </div>
            <ActivityFeed activities={activities} isLoading={activityLoading} limit={6} emptyLabel="No activity for you" />
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl bg-white border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">My Boards</h3>
            {boardsSafe.length === 0 ? (
              <EmptyState icon={<FolderKanban className="h-5 w-5" />} title="No boards yet" description="Once you create or join boards, they’ll appear here." />
            ) : (
              <div className="space-y-2">
                {boardsSafe.slice(0, 6).map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderKanban className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900 truncate">{b.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">{new Date((b as any).updatedAt ?? Date.now()).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-slate-500" />
              <h3 className="font-semibold text-slate-900">Async notes</h3>
            </div>
            <div className="text-xs text-slate-500">Your async thread previews will show up here once wired.</div>
          </section>
        </div>
      </div>
    </div>
  );
};

const ViewerDashboard = ({
  projects,
  tasks,
  unreadCount,
  activities,
  activityLoading,
  currentRole,
}: RoleDashboardProps) => {
  const tasksSafe = safeArray<Task>(tasks);
  const projectsSafe = safeArray<Project>(projects);

  const done = tasksSafe.filter((t) => t.status === 'DONE').length;
  const total = tasksSafe.length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const banner = (
    <div className="bg-sky-50 border border-sky-200 text-sky-900 rounded-xl p-3 text-sm flex items-center gap-2">
      <Eye className="h-4 w-4" />
      <span>You're viewing this workspace in read-only mode.</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {banner}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Read-only view of team progress</h1>
          <p className="text-sm text-slate-500 mt-1">Teams move fast—this view stays safe.</p>
        </div>
        <RolePill role={currentRole} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard tone="accent" label="Projects" value={projectsSafe.length} icon={<FolderKanban className="h-5 w-5" />} />
        <StatCard label="Tasks Done" value={done} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Completion Rate" value={`${completionRate}%`} icon={<BarChart3 className="h-5 w-5" />} />
        <StatCard label="Notifications" value={unreadCount} icon={<BellDot className="h-5 w-5" />} trend={unreadCount > 0 ? `${unreadCount} unread` : undefined} trendDirection="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <section className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-500" />
                <h3 className="font-semibold text-slate-900">Project progress</h3>
              </div>
              <span className="text-xs text-slate-400">Read-only</span>
            </div>
            {projectsSafe.length === 0 ? (
              <EmptyState icon={<FolderKanban className="h-5 w-5" />} title="No projects yet" description="As soon as projects are created, you'll see progress here." />
            ) : (
              <div className="space-y-3">
                {projectsSafe.slice(0, 5).map((p) => (
                  <div key={p.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">{done}/{total} tasks</p>
                      </div>
                      <div className="text-xs text-slate-500">{completionRate}%</div>
                    </div>
                    <ProgressBar value={done} max={Math.max(1, total)} tone="success" />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-slate-900 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-sky-300" />
                <h3 className="font-semibold">Burndown</h3>
              </div>
              <span className="text-xs text-slate-300">7 days</span>
            </div>
            <svg viewBox="0 0 300 110" width="100%" height="110" aria-hidden="true">
              <path d="M0 90 L50 80 L100 75 L150 60 L200 55 L250 45 L300 40" fill="none" stroke="rgb(52 211 153)" strokeWidth="3" strokeLinecap="round" />
              <path d="M0 90 L50 80 L100 75 L150 60 L200 55 L250 45 L300 40 L300 110 L0 110 Z" fill="rgb(52 211 153 / 0.12)" />
            </svg>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl bg-white border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Team Online</h3>
            <div className="text-xs text-slate-500">Presence wiring not available in current props.</div>
            <div className="mt-4 space-y-2">
              {Array.from({ length: Math.min(6, 3) }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-slate-900">Member {idx + 1}</span>
                  </div>
                  <span className="text-xs text-slate-500">—</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-slate-500" />
                <h3 className="font-semibold text-slate-900">Activity</h3>
              </div>
              <span className="text-xs text-slate-400">Read-only</span>
            </div>
            <ActivityFeed activities={activities} isLoading={activityLoading} limit={8} emptyLabel="No activity yet" />
          </section>
        </div>
      </div>
    </div>
  );
};

export { AdminDashboard, MemberDashboard, ViewerDashboard };

