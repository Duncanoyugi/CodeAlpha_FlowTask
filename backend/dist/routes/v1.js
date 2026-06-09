"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const workspace_routes_1 = __importDefault(require("../modules/workspaces/workspace.routes"));
const project_routes_1 = __importDefault(require("../modules/projects/project.routes"));
const board_routes_1 = __importDefault(require("../modules/boards/board.routes"));
const column_routes_1 = __importDefault(require("../modules/columns/column.routes"));
const task_routes_1 = __importDefault(require("../modules/tasks/task.routes"));
const comment_routes_1 = __importDefault(require("../modules/comments/comment.routes"));
const activity_routes_1 = __importDefault(require("../modules/activities/activity.routes"));
const notification_routes_1 = __importDefault(require("../modules/notifications/notification.routes"));
const invite_routes_1 = __importDefault(require("../modules/invites/invite.routes"));
const search_routes_1 = __importDefault(require("../modules/search/search.routes"));
const router = (0, express_1.Router)();
// Mount modules
router.use('/auth', auth_routes_1.default);
router.use('/workspaces', workspace_routes_1.default);
router.use('/workspaces/:workspaceId/projects', project_routes_1.default);
router.use('/workspaces/:workspaceId/projects/:projectId/boards', board_routes_1.default);
router.use('/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns', column_routes_1.default);
router.use('/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks', task_routes_1.default);
router.use('/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks/:taskId/comments', comment_routes_1.default);
router.use('/workspaces/:workspaceId/activities', activity_routes_1.default);
router.use('/workspaces/:workspaceId/search', search_routes_1.default);
router.use('/notifications', notification_routes_1.default);
router.use('/', invite_routes_1.default);
// Health check
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'TaskFlow API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
