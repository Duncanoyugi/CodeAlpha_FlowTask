"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workspace_controller_1 = require("./workspace.controller");
const validation_middleware_1 = require("../../../src/middleware/validation.middleware");
const workspace_schema_1 = require("./workspace.schema");
const auth_middleware_1 = require("../../../src/middleware/auth.middleware");
const router = (0, express_1.Router)();
const workspaceController = new workspace_controller_1.WorkspaceController();
// All workspace routes require authentication
router.use(auth_middleware_1.authMiddleware);
// Workspace CRUD
// Workspace creation is authorization-sensitive: enforce role-based capability at the controller/service boundary.
// Current codebase does not derive effective workspace role for creation (workspace doesn't exist yet), so we require auth middleware
// to attach userRole or reject.
router.post('/', (0, validation_middleware_1.validate)(workspace_schema_1.CreateWorkspaceSchema), workspaceController.createWorkspace);
router.get('/', workspaceController.getUserWorkspaces);
router.get('/:workspaceId', (0, validation_middleware_1.validate)(workspace_schema_1.WorkspaceIdSchema), workspaceController.getWorkspace);
router.patch('/:workspaceId', (0, validation_middleware_1.validate)(workspace_schema_1.UpdateWorkspaceSchema), workspaceController.updateWorkspace);
router.patch('/:workspaceId/transfer-ownership', (0, validation_middleware_1.validate)(workspace_schema_1.TransferOwnershipSchema), workspaceController.transferOwnership);
router.delete('/:workspaceId', (0, validation_middleware_1.validate)(workspace_schema_1.WorkspaceIdSchema), workspaceController.deleteWorkspace);
// Member management
router.get('/:workspaceId/members', (0, validation_middleware_1.validate)(workspace_schema_1.WorkspaceIdSchema), workspaceController.getWorkspaceMembers);
router.patch('/:workspaceId/members/:memberId/role', (0, validation_middleware_1.validate)(workspace_schema_1.UpdateMemberRoleSchema), workspaceController.updateMemberRole);
router.delete('/:workspaceId/members/:memberId', (0, validation_middleware_1.validate)(workspace_schema_1.WorkspaceIdSchema), workspaceController.removeMember);
exports.default = router;
