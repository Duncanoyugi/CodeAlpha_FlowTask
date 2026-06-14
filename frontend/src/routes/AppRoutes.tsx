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
import ProjectDetailPage from '@pages/project/ProjectDetailPage';
import BoardPage from '@pages/board/BoardPage';
import SearchPage from '@pages/search/SearchPage';
import SettingsPage from '@pages/settings/SettingsPage';
import NotFoundPage from '@pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';

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
        <Route path={ROUTES.BOARD} element={<BoardPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
      </Route>

      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
    </Routes>
  );
};

export default AppRoutes;
