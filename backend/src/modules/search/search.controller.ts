import { Request, Response, NextFunction } from 'express';
import { SearchService } from './search.service';
import { HttpStatus } from '../../constants/http';

const searchService = new SearchService();

export class SearchController {
  async globalSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { workspaceId } = req.params;
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Search query is required',
        });
        return;
      }
      
      const qStr = Array.isArray(q) ? q[0] : q;
      const results = await searchService.searchGlobal(workspaceId as string, qStr as string, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async searchTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { workspaceId } = req.params;
      const {
        q,
        assigneeId,
        priority,
        dueDateFrom,
        dueDateTo,
      } = req.query;
      
      const qStr = Array.isArray(q) ? q[0] : q;
      const assigneeIdStr = Array.isArray(assigneeId) ? assigneeId[0] : assigneeId;
      const priorityStr = Array.isArray(priority) ? priority[0] : priority;
      const dueDateFromStr = Array.isArray(dueDateFrom) ? dueDateFrom[0] : dueDateFrom;
      const dueDateToStr = Array.isArray(dueDateTo) ? dueDateTo[0] : dueDateTo;

      const results = await searchService.searchTasks(
        workspaceId as string,
        {
          query: qStr ? (Array.isArray(qStr) ? qStr[0] : String(qStr)) : undefined,
          assigneeId: Array.isArray(assigneeIdStr) ? assigneeIdStr[0] : assigneeIdStr as any,
          priority: Array.isArray(priorityStr) ? (priorityStr[0] as any) : (priorityStr as any),
          dueDateFrom: dueDateFromStr ? new Date(String(dueDateFromStr)) : undefined,
          dueDateTo: dueDateToStr ? new Date(String(dueDateToStr)) : undefined,
        },
        userId
      );

      
      res.status(HttpStatus.OK).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
}