"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const comment_service_1 = require("./comment.service");
const http_1 = require("../../../src/constants/http");
const commentService = new comment_service_1.CommentService();
class CommentController {
    async createComment(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { taskId } = req.params;
            const result = await commentService.createComment(taskId, userId, req.body);
            res.status(http_1.HttpStatus.CREATED).json({
                success: true,
                message: 'Comment added successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getComment(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { commentId } = req.params;
            const result = await commentService.getCommentById(commentId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTaskComments(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { taskId } = req.params;
            const result = await commentService.getTaskComments(taskId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateComment(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { commentId } = req.params;
            const result = await commentService.updateComment(commentId, userId, req.body);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Comment updated successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteComment(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { commentId } = req.params;
            await commentService.deleteComment(commentId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Comment deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CommentController = CommentController;
