import EmptyState from '@components/dashboard/EmptyState';
import { ShieldCheck } from 'lucide-react';

const RolesAccessPage = () => {
  return (
    <EmptyState
      icon={<ShieldCheck className="h-5 w-5" />}
      title="Roles & Access"
      description="Roles & Access page is being implemented."
      action={null}
    />
  );
};

export default RolesAccessPage;

