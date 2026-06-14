import type { ReactNode } from 'react';

export type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10">
      {icon ? (
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 grid place-items-center mb-4">{icon}</div>
      ) : null}
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description ? <p className="text-xs text-slate-500 mt-1 max-w-md">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
};

export default EmptyState;

