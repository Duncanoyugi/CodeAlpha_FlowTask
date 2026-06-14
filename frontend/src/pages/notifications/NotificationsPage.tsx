import EmptyState from '@components/dashboard/EmptyState';
import { BellDot } from 'lucide-react';

const NotificationsPage = () => {
  return (
    <EmptyState
      icon={<BellDot className="h-5 w-5" />}
      title="Notifications"
      description="Notifications page is being implemented."
      action={null}
    />
  );
};

export default NotificationsPage;

