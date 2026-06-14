import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '@constants/routes';

const WorkspaceDetailPage = () => {
  const { workspaceId } = useParams<{ workspaceId?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (workspaceId) {
      navigate(ROUTES.WORKSPACE_PROJECTS.replace(':workspaceId', workspaceId), { replace: true });
    }
  }, [workspaceId, navigate]);

  return null;
};

export default WorkspaceDetailPage;
