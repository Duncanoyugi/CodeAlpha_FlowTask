"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invite_controller_1 = require("./invite.controller");
const validation_middleware_1 = require("../../../src/middleware/validation.middleware");
const invite_schema_1 = require("./invite.schema");
const auth_middleware_1 = require("../../../src/middleware/auth.middleware");
const workspace_middleware_1 = require("../../../src/middleware/workspace.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
const inviteController = new invite_controller_1.InviteController();
// Public route - no auth required to check invite
router.get('/check', (0, validation_middleware_1.validate)(invite_schema_1.InviteTokenSchema), inviteController.getInviteByToken);
// Protected routes
router.use(auth_middleware_1.authMiddleware);
// Accept invite (authenticated)
router.post('/accept', (0, validation_middleware_1.validate)(invite_schema_1.AcceptInviteSchema), inviteController.acceptInvite);
// Workspace invite management (require workspace access)
router.use('/workspaces/:workspaceId/invites', workspace_middleware_1.workspaceAccessMiddleware);
router.post('/workspaces/:workspaceId/invites', (0, validation_middleware_1.validate)(invite_schema_1.CreateInviteSchema), inviteController.createInvite);
router.get('/workspaces/:workspaceId/invites', inviteController.getWorkspaceInvites);
router.delete('/workspaces/:workspaceId/invites/:inviteId', inviteController.revokeInvite);
exports.default = router;
