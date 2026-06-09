import { Request, Response, NextFunction } from 'express';
import { BoardService } from './board.service';
import { HttpStatus } from '../../../src/constants/http';

const boardService = new BoardService();

export class BoardController {
  async createBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { projectId } = req.params as { projectId: string };
      const result = await boardService.createBoard(projectId, userId, req.body);
      
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Board created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { boardId } = req.params as { boardId: string };
      const result = await boardService.getBoardById(boardId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectBoards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { projectId } = req.params as { projectId: string };
      const result = await boardService.getProjectBoards(projectId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { boardId } = req.params as { boardId: string };
      const result = await boardService.updateBoard(boardId, userId, req.body);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Board updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { boardId } = req.params as { boardId: string };
      const permanent = req.query.permanent === 'true';
      await boardService.deleteBoard(boardId, userId, permanent);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: permanent ? 'Board permanently deleted' : 'Board archived successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}