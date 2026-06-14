import type { Role } from '@constants/roles';

export type RolePillProps = {
  role: Role;
};

const RolePill = ({ role }: RolePillProps) => {
  const label = role?.toString?.().toLowerCase?.() ?? 'member';
  const tone =
    role === 'OWNER'
      ? 'bg-emerald-50 text-emerald-700'
      : role === 'ADMIN'
      ? 'bg-sky-50 text-sky-700'
      : role === 'VIEWER'
      ? 'bg-slate-100 text-slate-700'
      : 'bg-slate-100 text-slate-700';

  return (
    <span
      className={[
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        tone,
      ].join(' ')}
    >
      {label}
    </span>
  );
};

export default RolePill;

