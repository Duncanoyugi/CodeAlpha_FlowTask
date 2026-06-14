import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '@store/hooks';
import { ROUTES } from '@constants/routes';
import AuthLayout from '@layouts/AuthLayout';
import MainLayout from '@layouts/MainLayout';
import LoginPage from '@pages/auth/LoginPage';
import RegisterPage from '@pages/auth/RegisterPage';
import ForgotPasswordPage from '@pages/auth/ForgottenPasswordPage';
import VerifyOTPPage from '@pages/auth/VerifyOTP';
import DashboardPage from '@pages/dashboard/DashboardPage';
import HomePage from '@pages/HomePage';
import WorkspacesPage from '@pages/workspace/WorkspacesPage';
import WorkspaceDetailPage from '@pages/workspace/WorkspacesDetailPage';
import ProjectPage from '@pages/project/ProjectPage';

import BoardPage from '@pages/board/BoardPage';
import ProjectsPage from '@pages/projects/ProjectsPage';
import ProjectDetailPage from '@pages/projects/ProjectDetailPage';
import BoardsPage from '@pages/boards/BoardsPage';
import BoardDetailPage from '@pages/boards/BoardPage';
import MyTasksPage from '@pages/tasks/MyTasksPage';
import MembersPage from '@pages/members/MembersPage';
import RolesAccessPage from '@pages/roles/RolesAccessPage';
import AnalyticsPage from '@pages/analytics/AnalyticsPage';
import ActivityPage from '@pages/activity/ActivityPage';
import NotificationsPage from '@pages/notifications/NotificationsPage';
import ProfilePage from '@pages/profile/ProfilePage';
import WorkspaceSettingsPage from '@pages/settings/WorkspaceSettingsPage';

import SearchPage from '@pages/search/SearchPage';


import NotFoundPage from '@pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';
import { Role } from '@constants/roles';




const AppRoutes = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route element={<AuthLayout />}>
        <Route
          path={ROUTES.LOGIN}
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to={ROUTES.DASHBOARD} replace />
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            !isAuthenticated ? <RegisterPage /> : <Navigate to={ROUTES.DASHBOARD} replace />
          }
        />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.VERIFY_OTP} element={<VerifyOTPPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.WORKSPACES} element={<WorkspacesPage />} />
        <Route path={ROUTES.WORKSPACE_DETAIL} element={<WorkspaceDetailPage />} />
        <Route path={ROUTES.WORKSPACE_PROJECTS} element={<ProjectPage />} />
        <Route path={ROUTES.WORKSPACE_PROJECT_DETAIL} element={<ProjectDetailPage />} />

        <Route path={ROUTES.PROJECTS} element={<ProjectPage />} />
        <Route path={ROUTES.PROJECT_DETAIL} element={<ProjectDetailPage />} />
        <Route path={ROUTES.WORKSPACE_PROJECT_BOARD} element={<BoardPage />} />
        <Route
          path="/projects"
          element={
            <RoleGuard allow={[Role.OWNER, Role.ADMIN]}>
              <ProjectsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <RoleGuard allow={[Role.OWNER, Role.ADMIN]}>
              <ProjectDetailPage />
            </RoleGuard>
          }
        />

        <Route
          path="/boards"
          element={
            <RoleGuard allow={[Role.OWNER, Role.ADMIN]}>
              <BoardsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/boards/:boardId"
          element={
            <RoleGuard allow={[Role.OWNER, Role.ADMIN]}>
              <BoardDetailPage />
            </RoleGuard>
          }
        />

        <Route
          path="/tasks/me"
          element={
            <RoleGuard allow={[Role.MEMBER, Role.OWNER, Role.ADMIN]}>
              <MyTasksPage />
            </RoleGuard>
          }
        />

        <Route
          path="/members"
          element={
            <RoleGuard allow={[Role.ADMIN, Role.OWNER]}>
              <MembersPage />
            </RoleGuard>
          }
        />

        <Route
          path="/roles"
          element={
            <RoleGuard allow={[Role.OWNER]}>
              <RolesAccessPage />
            </RoleGuard>
          }
        />

        <Route
          path="/analytics"
          element={
            <RoleGuard allow={[Role.ADMIN, Role.OWNER]}>
              <AnalyticsPage />
            </RoleGuard>
          }
        />

        <Route
          path="/activity"
          element={
            <RoleGuard allow={[Role.ADMIN, Role.OWNER]}>
              <ActivityPage />
            </RoleGuard>
          }
        />

        <Route
          path="/notifications"
          element={
            <RoleGuard allow={[Role.ADMIN, Role.OWNER, Role.MEMBER, Role.VIEWER]}>
              <NotificationsPage />
            </RoleGuard>
          }
        />

        <Route
          path="/profile"
          element={
            <RoleGuard allow={[Role.ADMIN, Role.OWNER, Role.MEMBER, Role.VIEWER]}>
              <ProfilePage />
            </RoleGuard>
          }
        />

        <Route
          path="/settings"
          element={
            <RoleGuard allow={[Role.ADMIN, Role.OWNER]}>
              <WorkspaceSettingsPage />
            </RoleGuard>
          }
        />

        <Route path="/search" element={<SearchPage />} />
      </Route>


      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
    </Routes>
  );
};

export default AppRoutes;
