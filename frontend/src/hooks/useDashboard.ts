import { useQuery } from '@tanstack/react-query';

import { getAdminDashboard, getMemberDashboard } from '@/api/dashboard';
import type { AdminDashboardResponse, MemberDashboardResponse } from '@/types/dashboard.types';

export function useAdminDashboard(workspaceId?: string) {
  return useQuery<AdminDashboardResponse>({
    queryKey: ['dashboard', 'admin', workspaceId],
    queryFn: () => getAdminDashboard(workspaceId!),
    enabled: Boolean(workspaceId),
  });
}

export function useMemberDashboard() {
  return useQuery<MemberDashboardResponse>({
    queryKey: ['dashboard', 'member'],
    queryFn: getMemberDashboard,
  });
}

