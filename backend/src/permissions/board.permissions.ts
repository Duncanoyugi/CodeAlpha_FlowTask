import { Role } from '../generated/prisma';
import { canManageWorkspaceResources } from '../constants/roles';

export class BoardPermissions {
  static canManageBoard(userRole: Role, userId: string, workspaceOwnerId: string): boolean {
    return canManageWorkspaceResources(userRole, userId, workspaceOwnerId);
  }
}
