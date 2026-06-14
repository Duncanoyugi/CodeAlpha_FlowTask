import type { Activity } from '@/types/activity.types';
import { useMemo } from 'react';
import EmptyState from './EmptyState';
import Avatar from '@components/ui/Avatar';

export type ActivityFeedProps = {
  activities: Activity[];
  isLoading: boolean;
  limit?: number;
  emptyLabel?: string;
};

const formatRelative = (dateInput: string | Date) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 10) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
};

const safeInitials = (first?: string | null, last?: string | null) => {
  const f = (first ?? '').trim();
  const l = (last ?? '').trim();
  const a = (f[0] ?? '').toUpperCase();
  const b = (l[0] ?? '').toUpperCase();
  const out = (a + b).trim();
  return out || '??';
};

const normalizeAction = (action: string) => action.replace(/_/g, ' ').toLowerCase();

const ActivityFeed = ({ activities, isLoading, limit = 8, emptyLabel }: ActivityFeedProps) => {
  const safeActivities = useMemo(() => (Array.isArray(activities) ? activities : []), [activities]);
  const items = useMemo(() => safeActivities.slice(0, limit), [safeActivities, limit]);

  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-live="polite">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
            <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 rounded-full bg-slate-100 animate-pulse w-2/3" />
              <div className="h-3 rounded-full bg-slate-100 animate-pulse w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={null}
        title={emptyLabel ?? 'No activity yet'}
        description="When something happens in this workspace, you'll see it here."
      />
    );
  }

  return (
    <div className="space-y-0" role="feed">
      {items.map((a) => (
        <div key={a.id} className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
          <Avatar
            name={safeInitials(a.user?.firstName, a.user?.lastName)}
            className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold"
          />
          <div className="min-w-0">
            <div className="text-sm text-slate-900">
              <span className="font-semibold">
                {a.user?.firstName ?? a.user?.lastName ?? 'Someone'}
              </span>{' '}
              {normalizeAction(a.action)}
            </div>
            <div className="text-xs text-slate-500">{formatRelative(a.createdAt)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;

