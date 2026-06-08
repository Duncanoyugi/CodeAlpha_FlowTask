"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceController = void 0;
const workspace_service_1 = require("./workspace.service");
const http_1 = require("../../../src/constants/http");
const workspaceService = new workspace_service_1.WorkspaceService();
class WorkspaceController {
    async createWorkspace(req, res, next) {
        try {
            const userId = req.user?.userId;
            const result = await workspaceService.createWorkspace(userId, req.body);
            res.status(http_1.HttpStatus.CREATED).json({
                success: true,
                message: 'Workspace created successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getWorkspace(req, res, next) {
        try {
            const userId = req.user?.userId;
            const workspaceId = req.params.workspaceId;
            const result = await workspaceService.getWorkspaceById(workspaceId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserWorkspaces(req, res, next) {
        try {
            const userId = req.user?.userId;
            const result = await workspaceService.getUserWorkspaces(userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateWorkspace(req, res, next) {
        try {
            const userId = req.user?.userId;
            const userRole = req.userRole;
            const workspaceId = req.params.workspaceId;
            const result = await workspaceService.updateWorkspace(workspaceId, userId, userRole, req.body);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Workspace updated successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteWorkspace(req, res, next) {
        try {
            const userId = req.user?.userId;
            const workspaceId = req.params.workspaceId;
            await workspaceService.deleteWorkspace(workspaceId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Workspace deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getWorkspaceMembers(req, res, next) {
        try {
            const userId = req.user?.userId;
            const workspaceId = req.params.workspaceId;
            const result = await workspaceService.getWorkspaceMembers(workspaceId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateMemberRole(req, res, next) {
        try {
            const userId = req.user?.userId;
            const workspaceId = req.params.workspaceId;
            const memberId = req.params.memberId;
            const { role } = req.body;
            const result = await workspaceService.updateMemberRole(workspaceId, userId, memberId, role);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Member role updated successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async removeMember(req, res, next) {
        try {
            const userId = req.user?.userId;
            const workspaceId = req.params.workspaceId;
            const memberId = req.params.memberId;
            await workspaceService.removeMember(workspaceId, userId, memberId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Member removed successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.WorkspaceController = WorkspaceController;
