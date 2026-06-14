import EmptyState from '@components/dashboard/EmptyState';
import { Settings } from 'lucide-react';

const WorkspaceSettingsPage = () => {
  return (
    <EmptyState
      icon={<Settings className="h-5 w-5" />}
      title="Workspace Settings"
      description="Workspace settings page is being implemented."
      action={null}
    />
  );
};

export default WorkspaceSettingsPage;

