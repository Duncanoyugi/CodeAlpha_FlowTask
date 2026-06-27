export {
  assertProjectAccess,
  resolveProjectAccess,
  resolveWorkspaceAccess,
  resolveBoardAccess,
  resolveTaskAccess,
  resolveAccessibleProjectIds,
  type EffectiveRole,
  type ProjectAccess,
  type WorkspaceAccess,
  type BoardAccess,
  type TaskAccess,
} from './access-resolver';

export type ProjectAccessContext = {
  role: import('../generated/prisma').Role;
  ownerId: string;
  workspaceId: string;
  effectiveRole: import('./effective-role').EffectiveRole;
};
