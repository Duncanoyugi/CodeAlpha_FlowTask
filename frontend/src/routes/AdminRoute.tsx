import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@store/hooks';
import { Role } from '@constants/roles';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const { currentRole } = useAppSelector((state) => state.workspace);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (currentRole !== Role.ADMIN && currentRole !== Role.OWNER) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
