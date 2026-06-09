import { Router } from 'express';
import { ProjectController } from './project.controller';
import { validate } from '../../../src/middleware/validation.middleware';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ProjectIdSchema,
  AddProjectMemberSchema,
  ProjectMemberIdSchema,
} from './project.schema';
import { authMiddleware } from '../../../src/middleware/auth.middleware';
import { workspaceAccessMiddleware } from '../../../src/middleware/workspace.middleware';

const router = Router({ mergeParams: true });
const projectController = new ProjectController();

// All project routes require authentication and workspace access
router.use(authMiddleware);
router.use(workspaceAccessMiddleware);

// Project CRUD
router.post('/', validate(CreateProjectSchema), projectController.createProject);
router.get('/', projectController.getWorkspaceProjects);
router.get('/:projectId', validate(ProjectIdSchema), projectController.getProject);
router.patch('/:projectId', validate(UpdateProjectSchema), projectController.updateProject);
router.delete('/:projectId', validate(ProjectIdSchema), projectController.deleteProject);

// Project member management
router.get('/:projectId/members', validate(ProjectIdSchema), projectController.getProjectMembers);
router.post('/:projectId/members', validate(AddProjectMemberSchema), projectController.addProjectMember);
router.delete('/:projectId/members/:memberId', validate(ProjectMemberIdSchema), projectController.removeProjectMember);

export default router;