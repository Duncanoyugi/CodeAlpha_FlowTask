"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const search_service_1 = require("./search.service");
const http_1 = require("../../constants/http");
const searchService = new search_service_1.SearchService();
class SearchController {
    async globalSearch(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { workspaceId } = req.params;
            const { q } = req.query;
            if (!q || typeof q !== 'string') {
                res.status(http_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'Search query is required',
                });
                return;
            }
            const qStr = Array.isArray(q) ? q[0] : q;
            const results = await searchService.searchGlobal(workspaceId, qStr, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: results,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async searchTasks(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { workspaceId } = req.params;
            const { q, assigneeId, priority, dueDateFrom, dueDateTo, } = req.query;
            const qStr = Array.isArray(q) ? q[0] : q;
            const assigneeIdStr = Array.isArray(assigneeId) ? assigneeId[0] : assigneeId;
            const priorityStr = Array.isArray(priority) ? priority[0] : priority;
            const dueDateFromStr = Array.isArray(dueDateFrom) ? dueDateFrom[0] : dueDateFrom;
            const dueDateToStr = Array.isArray(dueDateTo) ? dueDateTo[0] : dueDateTo;
            const results = await searchService.searchTasks(workspaceId, {
                query: qStr ? (Array.isArray(qStr) ? qStr[0] : String(qStr)) : undefined,
                assigneeId: Array.isArray(assigneeIdStr) ? assigneeIdStr[0] : assigneeIdStr,
                priority: Array.isArray(priorityStr) ? priorityStr[0] : priorityStr,
                dueDateFrom: dueDateFromStr ? new Date(String(dueDateFromStr)) : undefined,
                dueDateTo: dueDateToStr ? new Date(String(dueDateToStr)) : undefined,
            }, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: results,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SearchController = SearchController;
