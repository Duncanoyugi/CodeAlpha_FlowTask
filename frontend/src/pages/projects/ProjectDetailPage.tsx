import { useParams } from 'react-router-dom';
import EmptyState from '@components/dashboard/EmptyState';
import { FolderKanban } from 'lucide-react';

const ProjectDetailPage = () => {
  const { projectId } = useParams();

  return (
    <EmptyState
      icon={<FolderKanban className="h-5 w-5" />}
      title="Project"
      description={projectId ? `Project detail for ${projectId} is being implemented.` : 'Project detail is being implemented.'}
      action={null}
    />
  );
};

export default ProjectDetailPage;

