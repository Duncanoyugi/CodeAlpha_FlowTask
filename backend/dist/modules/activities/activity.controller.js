"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityController = void 0;
const activity_service_1 = require("./activity.service");
const http_1 = require("../../../src/constants/http");
const activityService = new activity_service_1.ActivityService();
class ActivityController {
    async getWorkspaceActivities(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { workspaceId } = req.params;
            const result = await activityService.getWorkspaceActivities(workspaceId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTaskActivities(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { taskId } = req.params;
            const result = await activityService.getTaskActivities(taskId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProjectActivities(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { projectId } = req.params;
            const result = await activityService.getProjectActivities(projectId, userId);
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
exports.ActivityController = ActivityController;
