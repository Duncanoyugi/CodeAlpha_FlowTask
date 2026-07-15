"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const dashboard_controller_1 = require("./dashboard.controller");
const router = (0, express_1.Router)();
const controller = new dashboard_controller_1.DashboardController();
router.use(auth_middleware_1.authMiddleware);
// Admin dashboard
router.get('/workspaces/:workspaceId/dashboard/admin', controller.getAdminDashboard.bind(controller));
// Member dashboard
router.get('/users/me/dashboard/member', controller.getMemberDashboard.bind(controller));
exports.default = router;
