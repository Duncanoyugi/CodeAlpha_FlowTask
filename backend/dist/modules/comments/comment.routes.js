"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controller_1 = require("./comment.controller");
const validation_middleware_1 = require("../../../src/middleware/validation.middleware");
const comment_schema_1 = require("./comment.schema");
const auth_middleware_1 = require("../../../src/middleware/auth.middleware");
const workspace_middleware_1 = require("../../../src/middleware/workspace.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
const commentController = new comment_controller_1.CommentController();
// All comment routes require authentication and workspace access
router.use(auth_middleware_1.authMiddleware);
router.use(workspace_middleware_1.workspaceAccessMiddleware);
// Comment CRUD
router.post('/', (0, validation_middleware_1.validate)(comment_schema_1.CreateCommentSchema), commentController.createComment);
router.get('/', commentController.getTaskComments);
router.get('/:commentId', (0, validation_middleware_1.validate)(comment_schema_1.CommentIdSchema), commentController.getComment);
router.patch('/:commentId', (0, validation_middleware_1.validate)(comment_schema_1.UpdateCommentSchema), commentController.updateComment);
router.delete('/:commentId', (0, validation_middleware_1.validate)(comment_schema_1.CommentIdSchema), commentController.deleteComment);
exports.default = router;
