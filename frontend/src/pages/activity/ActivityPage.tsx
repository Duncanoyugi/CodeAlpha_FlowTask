import EmptyState from '@components/dashboard/EmptyState';
import { BarChart3 } from 'lucide-react';

const ActivityPage = () => {
  return (
    <EmptyState
      icon={<BarChart3 className="h-5 w-5" />}
      title="Activity"
      description="Activity page is being implemented."
      action={null}
    />
  );
};

export default ActivityPage;

