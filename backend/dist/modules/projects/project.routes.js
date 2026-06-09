"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("./project.controller");
const validation_middleware_1 = require("../../../src/middleware/validation.middleware");
const project_schema_1 = require("./project.schema");
const auth_middleware_1 = require("../../../src/middleware/auth.middleware");
const workspace_middleware_1 = require("../../../src/middleware/workspace.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
const projectController = new project_controller_1.ProjectController();
// All project routes require authentication and workspace access
router.use(auth_middleware_1.authMiddleware);
router.use(workspace_middleware_1.workspaceAccessMiddleware);
// Project CRUD
router.post('/', (0, validation_middleware_1.validate)(project_schema_1.CreateProjectSchema), projectController.createProject);
router.get('/', projectController.getWorkspaceProjects);
router.get('/:projectId', (0, validation_middleware_1.validate)(project_schema_1.ProjectIdSchema), projectController.getProject);
router.patch('/:projectId', (0, validation_middleware_1.validate)(project_schema_1.UpdateProjectSchema), projectController.updateProject);
router.delete('/:projectId', (0, validation_middleware_1.validate)(project_schema_1.ProjectIdSchema), projectController.deleteProject);
// Project member management
router.get('/:projectId/members', (0, validation_middleware_1.validate)(project_schema_1.ProjectIdSchema), projectController.getProjectMembers);
router.post('/:projectId/members', (0, validation_middleware_1.validate)(project_schema_1.AddProjectMemberSchema), projectController.addProjectMember);
router.delete('/:projectId/members/:memberId', (0, validation_middleware_1.validate)(project_schema_1.ProjectMemberIdSchema), projectController.removeProjectMember);
exports.default = router;
