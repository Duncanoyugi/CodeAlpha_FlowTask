"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
const http_1 = require("../../constants/http");
class DashboardController {
    async getAdminDashboard(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { workspaceId } = req.params;
            const data = await dashboard_service_1.dashboardService.getAdminDashboard({ workspaceId, userId });
            res.status(http_1.HttpStatus.OK).json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    }
    async getMemberDashboard(req, res, next) {
        try {
            const userId = req.user?.userId;
            const data = await dashboard_service_1.dashboardService.getMemberDashboard({ userId });
            res.status(http_1.HttpStatus.OK).json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    }
}
exports.DashboardController = DashboardController;
