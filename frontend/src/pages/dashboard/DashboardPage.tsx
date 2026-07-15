import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@store/hooks';
import { Role } from '@constants/roles';
import AdminDashboard from '@components/dashboard/AdminDashboard';
import MemberDashboard from '@components/dashboard/MemberDashboard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { currentWorkspace, currentRole } = useAppSelector((state) => state.workspace);

  const effectiveRole = currentRole ?? Role.MEMBER;
  const workspaceId = currentWorkspace?.id ?? '';

  useEffect(() => {
    if (isAuthenticated && effectiveRole === Role.VIEWER) {
      navigate('/', { replace: true });
    }
  }, [effectiveRole, isAuthenticated, navigate]);

  if (effectiveRole === Role.ADMIN || effectiveRole === Role.OWNER) {
    return <AdminDashboard workspaceId={workspaceId} currentRole={effectiveRole} />;
  }

  return <MemberDashboard currentRole={effectiveRole} />;
}



