import { cn } from '@utils/cn';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
  color?: string;
  isLoading?: boolean;
}

const StatCard = ({ title, value, icon, trend, trendUp, subtitle, color = 'indigo', isLoading }: StatCardProps) => {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    sky: 'bg-sky-50 text-sky-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
      <div className={cn('h-11 w-11 rounded-lg flex items-center justify-center', colorClasses[color] ?? colorClasses.indigo)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-xl font-semibold text-gray-900 mt-0.5">
          {isLoading ? '...' : value}
        </p>
        {trend && (
          <p className={cn('text-xs mt-0.5', trendUp ? 'text-emerald-600' : 'text-gray-500')}>
            {trend}
          </p>
        )}
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
