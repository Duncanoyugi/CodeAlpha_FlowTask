import type { AdminDashboardResponse, MemberDashboardResponse } from './dashboard.types';

// This project uses express + zod-like validation per module; for now keep DTOs as TS contracts.
// Validation is minimal to avoid introducing a new dependency.

export type GetAdminDashboardResponseDto = AdminDashboardResponse;
export type GetMemberDashboardResponseDto = MemberDashboardResponse;

