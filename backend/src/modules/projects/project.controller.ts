import { Request, Response, NextFunction } from 'express';
import { ProjectService } from './project.service';
import { HttpStatus } from '../../../src/constants/http';

const projectService = new ProjectService();

export class ProjectController {
  async createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { workspaceId } = req.params as { workspaceId: string };
      const result = await projectService.createProject(workspaceId, userId, req.body);
      
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Project created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { projectId } = req.params as { projectId: string };
      const result = await projectService.getProjectById(projectId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkspaceProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { workspaceId } = req.params as { workspaceId: string };
      const result = await projectService.getWorkspaceProjects(workspaceId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { projectId } = req.params as { projectId: string };
      const result = await projectService.updateProject(projectId, userId, req.body);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Project updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { projectId } = req.params as { projectId: string };
      const permanent = req.query.permanent === 'true';
      await projectService.deleteProject(projectId, userId, permanent);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: permanent ? 'Project permanently deleted' : 'Project archived successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async addProjectMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { projectId } = req.params as { projectId: string };
      const { userId: targetUserId } = req.body as { userId: string };
      const result = await projectService.addProjectMember(projectId, userId, targetUserId);
      
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Member added to project successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeProjectMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { projectId, memberId } = req.params as { projectId: string; memberId: string };
      await projectService.removeProjectMember(projectId, userId, memberId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Member removed from project successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { projectId } = req.params as { projectId: string };
      const result = await projectService.getProjectMembers(projectId, userId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}