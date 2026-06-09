import { Request, Response, NextFunction } from 'express';
import { TaskService } from './task.service';
import { HttpStatus } from '../../../src/constants/http';

const taskService = new TaskService();

export class TaskController {
  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { boardId, columnId } = req.params as { boardId: string; columnId: string };
      const result = await taskService.createTask(boardId, columnId, userId, req.body);
      
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Task created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { taskId } = req.params as { taskId: string };
      const result = await taskService.getTaskById(taskId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getColumnTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { columnId } = req.params as { columnId: string };
      const result = await taskService.getColumnTasks(columnId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBoardTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { columnId } = req.params as { columnId: string };
      const { boardId } = req.params as { boardId: string };
      const result = await taskService.getBoardTasks(boardId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { taskId } = req.params as { taskId: string };
      const result = await taskService.updateTask(taskId, userId, req.body);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Task updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async moveTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { taskId } = req.params as { taskId: string };
      const result = await taskService.moveTask(taskId, userId, req.body);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Task moved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { taskId } = req.params as { taskId: string };
      const permanent = req.query.permanent === 'true';
      await taskService.deleteTask(taskId, userId, permanent);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: permanent ? 'Task permanently deleted' : 'Task archived successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const result = await taskService.getUserTasks(userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async reorderTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { columnId } = req.params as { columnId: string };
      const { taskIds } = req.body as { taskIds: string[] };
      await taskService.reorderTasks(columnId, userId, taskIds);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Tasks reordered successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}