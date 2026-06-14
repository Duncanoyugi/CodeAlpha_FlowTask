import type { CSSProperties } from 'react';

export type ProgressBarTone = 'accent' | 'success' | 'warning' | 'danger';

export type ProgressBarProps = {
  value: number;
  max?: number;
  tone?: ProgressBarTone;
  className?: string;
};

const toneToStyles: Record<ProgressBarTone, { track: string; fill: string }> = {
  accent: { track: 'bg-slate-100', fill: 'bg-sky-500' },
  success: { track: 'bg-slate-100', fill: 'bg-emerald-500' },
  warning: { track: 'bg-slate-100', fill: 'bg-amber-500' },
  danger: { track: 'bg-slate-100', fill: 'bg-rose-500' },
};

const ProgressBar = ({ value, max = 100, tone = 'accent', className }: ProgressBarProps) => {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const styles = toneToStyles[tone];

  return (
    <div
      className={[
        'h-2 rounded-full overflow-hidden transition-all duration-500',
        styles.track,
        className ?? '',
      ].join(' ')}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className={[styles.fill, 'h-full rounded-full'].join(' ')} style={{ width: `${pct}%` } as CSSProperties} />
    </div>
  );
};

export default ProgressBar;

