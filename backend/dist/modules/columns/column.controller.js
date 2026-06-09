"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnController = void 0;
const column_service_1 = require("./column.service");
const http_1 = require("../../../src/constants/http");
const columnService = new column_service_1.ColumnService();
class ColumnController {
    async createColumn(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { boardId } = req.params;
            const result = await columnService.createColumn(boardId, userId, req.body);
            res.status(http_1.HttpStatus.CREATED).json({
                success: true,
                message: 'Column created successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getColumn(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { columnId } = req.params;
            const result = await columnService.getColumnById(columnId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getBoardColumns(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { boardId } = req.params;
            const result = await columnService.getBoardColumns(boardId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateColumn(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { columnId } = req.params;
            const result = await columnService.updateColumn(columnId, userId, req.body);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Column updated successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteColumn(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { columnId } = req.params;
            await columnService.deleteColumn(columnId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Column deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async reorderColumns(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { boardId } = req.params;
            await columnService.reorderColumns(boardId, userId, req.body);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Columns reordered successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ColumnController = ColumnController;
