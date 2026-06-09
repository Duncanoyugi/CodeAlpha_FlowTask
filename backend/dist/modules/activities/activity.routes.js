"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activity_controller_1 = require("./activity.controller");
const auth_middleware_1 = require("../../../src/middleware/auth.middleware");
const workspace_middleware_1 = require("../../../src/middleware/workspace.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
const activityController = new activity_controller_1.ActivityController();
// All activity routes require authentication and workspace access
router.use(auth_middleware_1.authMiddleware);
router.use(workspace_middleware_1.workspaceAccessMiddleware);
router.get('/workspace', activityController.getWorkspaceActivities);
router.get('/projects/:projectId', activityController.getProjectActivities);
router.get('/tasks/:taskId', activityController.getTaskActivities);
exports.default = router;
