import EmptyState from '@components/dashboard/EmptyState';
import { BarChart3 } from 'lucide-react';

const AnalyticsPage = () => {
  return (
    <EmptyState
      icon={<BarChart3 className="h-5 w-5" />}
      title="Analytics"
      description="Analytics page is being implemented."
      action={null}
    />
  );
};

export default AnalyticsPage;

