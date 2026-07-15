import { api } from '@lib/axios';
import type { AdminDashboardResponse, MemberDashboardResponse } from '../types/dashboard.types';


export async function getAdminDashboard(workspaceId: string): Promise<AdminDashboardResponse> {
  const res = await api.get(`/api/v1/workspaces/${workspaceId}/dashboard/admin`);
  return res.data.data;
}

export async function getMemberDashboard(): Promise<MemberDashboardResponse> {
  const res = await api.get(`/api/v1/users/me/dashboard/member`);
  return res.data.data;
}

