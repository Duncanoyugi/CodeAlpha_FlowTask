import { Router } from 'express';
import { InviteController } from './invite.controller';
import { validate } from '../../../src/middleware/validation.middleware';
import { CreateInviteSchema, InviteTokenSchema, AcceptInviteSchema } from './invite.schema';
import { authMiddleware } from '../../../src/middleware/auth.middleware';
import { workspaceAccessMiddleware } from '../../../src/middleware/workspace.middleware';

const router = Router({ mergeParams: true });
const inviteController = new InviteController();

// Public route - no auth required to check invite
router.get('/check', validate(InviteTokenSchema), inviteController.getInviteByToken);

// Protected routes
router.use(authMiddleware);

// Accept invite (authenticated)
router.post('/accept', validate(AcceptInviteSchema), inviteController.acceptInvite);

// Workspace invite management (require workspace access)
router.use('/workspaces/:workspaceId/invites', workspaceAccessMiddleware);
router.post('/workspaces/:workspaceId/invites', validate(CreateInviteSchema), inviteController.createInvite);
router.get('/workspaces/:workspaceId/invites', inviteController.getWorkspaceInvites);
router.delete('/workspaces/:workspaceId/invites/:inviteId', inviteController.revokeInvite);

export default router;