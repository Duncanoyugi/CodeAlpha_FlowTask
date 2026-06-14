
import EmptyState from '@components/dashboard/EmptyState';
import { FolderKanban } from 'lucide-react';

const ProjectsPage = () => {
  // TODO: implement full Projects page (grid/list, toolbar filters, modals)
  return (
    <EmptyState
      icon={<FolderKanban className="h-5 w-5" />}
      title="Projects"
      description="Projects page is being implemented."
      action={null}
    />
  );
};

export default ProjectsPage;

