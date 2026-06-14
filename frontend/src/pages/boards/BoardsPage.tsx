import EmptyState from '@components/dashboard/EmptyState';
import { FolderKanban } from 'lucide-react';

const BoardsPage = () => {
  return (
    <EmptyState
      icon={<FolderKanban className="h-5 w-5" />}
      title="Boards"
      description="Boards page is being implemented."
      action={null}
    />
  );
};

export default BoardsPage;

