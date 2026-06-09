import { Request, Response, NextFunction } from 'express';
import { CommentService } from './comment.service';
import { HttpStatus } from '../../../src/constants/http';

const commentService = new CommentService();

export class CommentController {
  async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { taskId } = req.params as { taskId: string };
      const result = await commentService.createComment(taskId, userId, req.body);
      
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Comment added successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { commentId } = req.params as { commentId: string };
      const result = await commentService.getCommentById(commentId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { taskId } = req.params as { taskId: string };
      const result = await commentService.getTaskComments(taskId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { commentId } = req.params as { commentId: string };
      const result = await commentService.updateComment(commentId, userId, req.body);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Comment updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { commentId } = req.params as { commentId: string };
      await commentService.deleteComment(commentId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}