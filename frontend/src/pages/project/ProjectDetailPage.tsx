import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { fetchProjectById } from '@store/slices/projectSlice';
import { fetchProjectBoards } from '@store/slices/boardSlice';
import { ROUTES } from '@constants/routes';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';

const ProjectDetailPage = () => {
  const { workspaceId, projectId } = useParams<{ workspaceId?: string; projectId?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProject } = useAppSelector((state) => state.project);
  const { boards } = useAppSelector((state) => state.board);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(projectId));
    }
  }, [projectId, dispatch]);

  useEffect(() => {
    if (workspaceId && projectId) {
      dispatch(fetchProjectBoards({ workspaceId, projectId }));
    }
  }, [workspaceId, projectId, dispatch]);

  useEffect(() => {
    if (workspaceId && projectId && boards.length > 0) {
      navigate(
        ROUTES.WORKSPACE_PROJECT_BOARD
          .replace(':workspaceId', workspaceId)
          .replace(':projectId', projectId)
          .replace(':boardId', boards[0].id),
        { replace: true }
      );
    }
  }, [workspaceId, projectId, boards, navigate]);

  if (!currentProject) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900">{currentProject.name}</h1>
      <p className="text-gray-500 mt-2">This project does not have any boards yet.</p>
      <Button className="mt-4" onClick={() => navigate(-1)}>
        Go Back
      </Button>
    </div>
  );
};

export default ProjectDetailPage;
