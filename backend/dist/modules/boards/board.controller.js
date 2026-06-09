"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardController = void 0;
const board_service_1 = require("./board.service");
const http_1 = require("../../../src/constants/http");
const boardService = new board_service_1.BoardService();
class BoardController {
    async createBoard(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { projectId } = req.params;
            const result = await boardService.createBoard(projectId, userId, req.body);
            res.status(http_1.HttpStatus.CREATED).json({
                success: true,
                message: 'Board created successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getBoard(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { boardId } = req.params;
            const result = await boardService.getBoardById(boardId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProjectBoards(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { projectId } = req.params;
            const result = await boardService.getProjectBoards(projectId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateBoard(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { boardId } = req.params;
            const result = await boardService.updateBoard(boardId, userId, req.body);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Board updated successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteBoard(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { boardId } = req.params;
            const permanent = req.query.permanent === 'true';
            await boardService.deleteBoard(boardId, userId, permanent);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: permanent ? 'Board permanently deleted' : 'Board archived successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BoardController = BoardController;
