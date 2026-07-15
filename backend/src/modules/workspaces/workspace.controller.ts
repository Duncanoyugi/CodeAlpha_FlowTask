import { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from './workspace.service';
import { HttpStatus } from '../../../src/constants/http';

const workspaceService = new WorkspaceService();

export class WorkspaceController {
  async createWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const result = await workspaceService.createWorkspace(userId, req.body);
      
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Workspace created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const workspaceId = req.params.workspaceId as string;
      const result = await workspaceService.getWorkspaceById(workspaceId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserWorkspaces(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const result = await workspaceService.getUserWorkspaces(userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const workspaceId = req.params.workspaceId as string;
      const result = await workspaceService.updateWorkspace(workspaceId, userId, req.body);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Workspace updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const workspaceId = req.params.workspaceId as string;
      await workspaceService.deleteWorkspace(workspaceId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Workspace deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async transferOwnership(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const workspaceId = req.params.workspaceId as string;
      const { newOwnerId } = req.body;
      const result = await workspaceService.transferOwnership(workspaceId, userId, newOwnerId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Workspace ownership transferred successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkspaceMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const workspaceId = req.params.workspaceId as string;
      const result = await workspaceService.getWorkspaceMembers(workspaceId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const workspaceId = req.params.workspaceId as string;
      const memberId = req.params.memberId as string;
      const { role } = req.body;
      const result = await workspaceService.updateMemberRole(workspaceId, userId, memberId, role);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Member role updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const workspaceId = req.params.workspaceId as string;
      const memberId = req.params.memberId as string;
      await workspaceService.removeMember(workspaceId, userId, memberId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}