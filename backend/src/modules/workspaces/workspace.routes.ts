import { Router } from 'express';
import { WorkspaceController } from './workspace.controller';
import { validate } from '../../../src/middleware/validation.middleware';
import {
  CreateWorkspaceSchema,
  UpdateWorkspaceSchema,
  WorkspaceIdSchema,
  UpdateMemberRoleSchema,
} from './workspace.schema';
import { authMiddleware } from '../../../src/middleware/auth.middleware';
import { workspaceAccessMiddleware } from '../../../src/middleware/workspace.middleware';

const router = Router();
const workspaceController = new WorkspaceController();

// All workspace routes require authentication
router.use(authMiddleware);

// Workspace CRUD
router.post('/', validate(CreateWorkspaceSchema), workspaceController.createWorkspace);
router.get('/', workspaceController.getUserWorkspaces);
router.get('/:workspaceId', validate(WorkspaceIdSchema), workspaceController.getWorkspace);
router.patch('/:workspaceId', validate(UpdateWorkspaceSchema), workspaceController.updateWorkspace);
router.delete('/:workspaceId', validate(WorkspaceIdSchema), workspaceController.deleteWorkspace);

// Member management
router.get('/:workspaceId/members', validate(WorkspaceIdSchema), workspaceController.getWorkspaceMembers);
router.patch('/:workspaceId/members/:memberId/role', validate(UpdateMemberRoleSchema), workspaceController.updateMemberRole);
router.delete('/:workspaceId/members/:memberId', validate(WorkspaceIdSchema), workspaceController.removeMember);

export default router;