import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { HttpStatus } from '../../constants/http';


export class DashboardController {
  async getAdminDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId as string;
      const { workspaceId } = req.params as { workspaceId: string };

      const data = await dashboardService.getAdminDashboard({ workspaceId, userId });

      res.status(HttpStatus.OK).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }

  async getMemberDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId as string;

      const data = await dashboardService.getMemberDashboard({ userId });

      res.status(HttpStatus.OK).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }
}

