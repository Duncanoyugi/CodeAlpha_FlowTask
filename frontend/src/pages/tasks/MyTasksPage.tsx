import EmptyState from '@components/dashboard/EmptyState';
import { CheckSquare2 } from 'lucide-react';

const MyTasksPage = () => {
  return (
    <EmptyState
      icon={<CheckSquare2 className="h-5 w-5" />}
      title="My Tasks"
      description="My Tasks page is being implemented."
      action={null}
    />
  );
};

export default MyTasksPage;

