import { Request, Response, NextFunction } from 'express';
import { InviteService } from './invite.service';
import { HttpStatus } from '../../../src/constants/http';

const inviteService = new InviteService();

export class InviteController {
  async createInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { workspaceId } = req.params as { workspaceId: string };
      const result = await inviteService.createInvite(workspaceId, userId, req.body);
      
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Invite sent successfully',
        data: {
          id: result.id,
          email: result.email,
          role: result.role,
          expiresAt: result.expiresAt,
          inviteLink: `${process.env.FRONTEND_URL}/invite?token=${result.token}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getInviteByToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query as { token: string };
      const result = await inviteService.getInviteByToken(token);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          workspace: (result as any).workspace,
          role: result.role,
          expiresAt: result.expiresAt,
          invitedBy: (result as any).creator,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async acceptInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { token } = req.body;
      const result = await inviteService.acceptInvite(token, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Invite accepted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkspaceInvites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { workspaceId } = req.params as { workspaceId: string };
      const result = await inviteService.getWorkspaceInvites(workspaceId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async revokeInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { workspaceId, inviteId } = req.params as { workspaceId: string; inviteId: string };
      await inviteService.revokeInvite(workspaceId, userId, inviteId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Invite revoked successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}