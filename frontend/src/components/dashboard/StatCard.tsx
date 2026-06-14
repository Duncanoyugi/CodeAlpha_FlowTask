import { cn } from '@utils/cn';
import type { ReactNode } from 'react';

export type StatCardTone = 'default' | 'dark' | 'accent';

export type StatCardProps = {
  label: string;
  value: number | string;
  icon: ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
  tone?: StatCardTone;
  isLoading?: boolean;
};

const StatCard = ({
  label,
  value,
  icon,
  trend,
  trendDirection = 'up',
  tone = 'default',
  isLoading,
}: StatCardProps) => {
  const base =
    tone === 'dark'
      ? 'bg-slate-900 text-white'
      : tone === 'accent'
      ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white border border-transparent'
      : 'bg-white text-slate-900 border border-slate-200';

  const iconWrap =
    tone === 'dark'
      ? 'bg-white/10 text-white'
      : tone === 'accent'
      ? 'bg-white/10 text-white'
      : 'bg-slate-100 text-slate-700';

  const trendClass = trendDirection === 'up' ? 'text-emerald-600' : 'text-rose-600';

  return (
    <div className={cn('rounded-2xl p-4 flex items-center gap-4', base)}>
      <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center', iconWrap)}>{icon}</div>
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
        <div className="text-2xl font-semibold mt-0.5">{isLoading ? '...' : value}</div>
        {trend ? (
          <div className={cn('text-xs mt-1', tone === 'accent' || tone === 'dark' ? 'text-sky-100/80' : trendClass)}>
            {trend}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StatCard;

