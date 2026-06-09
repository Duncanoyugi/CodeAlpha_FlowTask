"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const project_service_1 = require("./project.service");
const http_1 = require("../../../src/constants/http");
const projectService = new project_service_1.ProjectService();
class ProjectController {
    async createProject(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { workspaceId } = req.params;
            const result = await projectService.createProject(workspaceId, userId, req.body);
            res.status(http_1.HttpStatus.CREATED).json({
                success: true,
                message: 'Project created successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProject(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { projectId } = req.params;
            const result = await projectService.getProjectById(projectId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getWorkspaceProjects(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { workspaceId } = req.params;
            const result = await projectService.getWorkspaceProjects(workspaceId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateProject(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { projectId } = req.params;
            const result = await projectService.updateProject(projectId, userId, req.body);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Project updated successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteProject(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { projectId } = req.params;
            const permanent = req.query.permanent === 'true';
            await projectService.deleteProject(projectId, userId, permanent);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: permanent ? 'Project permanently deleted' : 'Project archived successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async addProjectMember(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { projectId } = req.params;
            const { userId: targetUserId } = req.body;
            const result = await projectService.addProjectMember(projectId, userId, targetUserId);
            res.status(http_1.HttpStatus.CREATED).json({
                success: true,
                message: 'Member added to project successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async removeProjectMember(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { projectId, memberId } = req.params;
            await projectService.removeProjectMember(projectId, userId, memberId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Member removed from project successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProjectMembers(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { projectId } = req.params;
            const result = await projectService.getProjectMembers(projectId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ProjectController = ProjectController;
