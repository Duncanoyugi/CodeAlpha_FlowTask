import { useParams } from 'react-router-dom';
import EmptyState from '@components/dashboard/EmptyState';
import { FolderKanban } from 'lucide-react';

const BoardPage = () => {
  const { boardId } = useParams();

  return (
    <EmptyState
      icon={<FolderKanban className="h-5 w-5" />}
      title="Board"
      description={boardId ? `Board detail for ${boardId} is being implemented.` : 'Board detail is being implemented.'}
      action={null}
    />
  );
};

export default BoardPage;

