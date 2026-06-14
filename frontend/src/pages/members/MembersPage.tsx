import EmptyState from '@components/dashboard/EmptyState';
import { Users } from 'lucide-react';

const MembersPage = () => {
  return (
    <EmptyState
      icon={<Users className="h-5 w-5" />}
      title="Members"
      description="Members page is being implemented."
      action={null}
    />
  );
};

export default MembersPage;

