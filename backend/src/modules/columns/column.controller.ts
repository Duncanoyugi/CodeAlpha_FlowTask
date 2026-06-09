import { Request, Response, NextFunction } from 'express';
import { ColumnService } from './column.service';
import { HttpStatus } from '../../../src/constants/http';

const columnService = new ColumnService();

export class ColumnController {
  async createColumn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { boardId } = req.params as { boardId: string };
      const result = await columnService.createColumn(boardId, userId, req.body);
      
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Column created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getColumn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { columnId } = req.params as { columnId: string };
      const result = await columnService.getColumnById(columnId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBoardColumns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { boardId } = req.params as { boardId: string };
      const result = await columnService.getBoardColumns(boardId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateColumn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { columnId } = req.params as { columnId: string };
      const result = await columnService.updateColumn(columnId, userId, req.body);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Column updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteColumn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { columnId } = req.params as { columnId: string };
      await columnService.deleteColumn(columnId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Column deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async reorderColumns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { boardId } = req.params as { boardId: string };
      await columnService.reorderColumns(boardId, userId, req.body);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Columns reordered successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}