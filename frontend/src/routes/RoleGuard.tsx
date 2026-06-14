import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@store/hooks';
import { Role } from '@constants/roles';
import EmptyState from '@components/dashboard/EmptyState';
import { Lock } from 'lucide-react';

interface RoleGuardProps {
  allow: Role[];
  children: React.ReactNode;
}

const RoleGuard = ({ allow, children }: RoleGuardProps) => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const { currentRole } = useAppSelector((state) => state.workspace);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // If role is not loaded yet, treat as loading to avoid flashing denied state.
  if (!currentRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!allow.includes(currentRole)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          icon={<Lock className="h-5 w-5" />}
          title="You don't have access to this area."
          description="Your current role does not permit viewing this page."
          action={null}
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;

