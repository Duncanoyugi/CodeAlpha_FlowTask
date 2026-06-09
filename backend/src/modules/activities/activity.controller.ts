import { Request, Response, NextFunction } from 'express';
import { ActivityService } from './activity.service';
import { HttpStatus } from '../../../src/constants/http';

const activityService = new ActivityService();

export class ActivityController {
  async getWorkspaceActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { workspaceId } = req.params as { workspaceId: string };
      const result = await activityService.getWorkspaceActivities(workspaceId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { taskId } = req.params as { taskId: string };
      const result = await activityService.getTaskActivities(taskId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { projectId } = req.params as { projectId: string };
      const result = await activityService.getProjectActivities(projectId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}