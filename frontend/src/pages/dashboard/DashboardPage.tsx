import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getCurrentUser } from '@store/slices/authSlice';
import { fetchWorkspaces, fetchWorkspaceMembers } from '@store/slices/workspaceSlice';
import { fetchTasks } from '@store/slices/taskSlice';
import { fetchColumns } from '@store/slices/boardSlice';
import { fetchProjectActivities, fetchWorkspaceActivities } from '@store/slices/activitySlice';
import { Role } from '@constants/roles';
import {
  AdminDashboard,
  MemberDashboard,
  ViewerDashboard,
} from '@pages/dashboard';
import Spinner from '@components/ui/Spinner';

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading: authLoading } = useAppSelector(
    (state) => state.auth
  );
  const { workspaces, currentWorkspace, currentRole } = useAppSelector(
    (state) => state.workspace
  );
  const { projects } = useAppSelector((state) => state.project);
  const { boards } = useAppSelector((state) => state.board);
  const { tasks } = useAppSelector((state) => state.task);
  const { unreadCount } = useAppSelector((state) => state.notification);
  const { activities, isLoading: activityLoading } = useAppSelector(
    (state) => state.activity
  );

  const effectiveRole = currentRole ?? Role.MEMBER;

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getCurrentUser());
    }
  }, [isAuthenticated, user, dispatch]);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    dispatch(fetchWorkspaces());
  }, [isAuthenticated, authLoading, dispatch]);

  useEffect(() => {
    const ws = currentWorkspace || workspaces[0];
    if (!ws?.id) return;
    dispatch(fetchWorkspaceMembers(ws.id));

    const firstProject = projects[0];
    const firstBoard = boards[0];

    if (firstProject?.id && ws.id) {
      dispatch(fetchProjectActivities({ workspaceId: ws.id, projectId: firstProject.id }));
    } else if (ws.id) {
      dispatch(fetchWorkspaceActivities(ws.id));
    }

    if (firstBoard?.id) {
      dispatch(fetchColumns(firstBoard.id));
      dispatch(fetchTasks(firstBoard.id));
    }
  }, [currentWorkspace, workspaces, projects, boards, dispatch]);

  if (authLoading || (!user && isAuthenticated)) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const sharedProps = {
    workspaces,
    projects,
    tasks,
    boards,
    activities,
    unreadCount,
    activityLoading,
    currentRole: effectiveRole,
    currentWorkspace,
    user,
  };

  switch (effectiveRole) {
    case Role.ADMIN:
    case Role.OWNER:
      return <AdminDashboard {...sharedProps} />;
    case Role.MEMBER:
      return <MemberDashboard {...sharedProps} />;
    case Role.VIEWER:
      return <ViewerDashboard {...sharedProps} />;
    default:
      return <ViewerDashboard {...sharedProps} />;
  }
};

export default DashboardPage;
