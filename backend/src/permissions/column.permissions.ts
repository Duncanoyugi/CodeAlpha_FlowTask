import { Role } from '../generated/prisma';
import { canManageWorkspaceResources } from '../constants/roles';

export class ColumnPermissions {
  static canManageColumn(userRole: Role, userId: string, workspaceOwnerId: string): boolean {
    return canManageWorkspaceResources(userRole, userId, workspaceOwnerId);
  }
}
