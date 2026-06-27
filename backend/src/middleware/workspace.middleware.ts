import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ForbiddenError } from '../utils/error';
import { resolveWorkspaceAccess } from '../permissions/access-resolver';

export const workspaceAccessMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workspaceId = req.params.workspaceId as string;
    const userId = req.user?.userId;

    if (!workspaceId) {
      return next();
    }

    if (!userId) {
      throw new ForbiddenError('Authentication required');
    }

    const access = await resolveWorkspaceAccess(workspaceId, userId);

    (req as any).userRole = access.permissionRole;
    (req as any).effectiveRole = access.effectiveRole;
    next();
  } catch (error) {
    next(error);
  }
};
