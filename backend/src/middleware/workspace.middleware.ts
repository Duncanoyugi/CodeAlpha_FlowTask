import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { prisma } from '../lib/prisma';
import { ForbiddenError, NotFoundError } from '../utils/error';

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

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenError('You do not have access to this workspace');
    }

    (req as any).userRole = member.role;
    next();
  } catch (error) {
    next(error);
  }
};