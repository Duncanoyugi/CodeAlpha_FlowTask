"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const task_service_1 = require("./task.service");
const http_1 = require("../../../src/constants/http");
const taskService = new task_service_1.TaskService();
class TaskController {
    async createTask(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { boardId, columnId } = req.params;
            const result = await taskService.createTask(boardId, columnId, userId, req.body);
            res.status(http_1.HttpStatus.CREATED).json({
                success: true,
                message: 'Task created successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTask(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { taskId } = req.params;
            const result = await taskService.getTaskById(taskId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getColumnTasks(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { columnId } = req.params;
            const result = await taskService.getColumnTasks(columnId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getBoardTasks(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { columnId } = req.params;
            const { boardId } = req.params;
            const result = await taskService.getBoardTasks(boardId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateTask(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { taskId } = req.params;
            const result = await taskService.updateTask(taskId, userId, req.body);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Task updated successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async moveTask(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { taskId } = req.params;
            const result = await taskService.moveTask(taskId, userId, req.body);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Task moved successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteTask(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { taskId } = req.params;
            const permanent = req.query.permanent === 'true';
            await taskService.deleteTask(taskId, userId, permanent);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: permanent ? 'Task permanently deleted' : 'Task archived successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserTasks(req, res, next) {
        try {
            const userId = req.user?.userId;
            const result = await taskService.getUserTasks(userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async reorderTasks(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { columnId } = req.params;
            const { taskIds } = req.body;
            await taskService.reorderTasks(columnId, userId, taskIds);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Tasks reordered successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TaskController = TaskController;
