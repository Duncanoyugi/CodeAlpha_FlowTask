"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const project_repository_1 = require("./project.repository");
const error_1 = require("../../../src/utils/error");
const prisma_1 = require("../../../src/lib/prisma");
const project_permissions_1 = require("../../../src/permissions/project.permissions");
const project_access_permissions_1 = require("../../../src/permissions/project-access.permissions");
class ProjectService {
    projectRepository;
    constructor() {
        this.projectRepository = new project_repository_1.ProjectRepository();
    }
    async checkWorkspaceAccess(workspaceId, userId) {
        const [member, workspace] = await Promise.all([
            prisma_1.prisma.workspaceMember.findUnique({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId,
                    },
                },
            }),
            prisma_1.prisma.workspace.findUnique({
                where: { id: workspaceId },
                select: { ownerId: true },
            }),
        ]);
        if (!member || !workspace) {
            throw new error_1.ForbiddenError('You do not have access to this workspace');
        }
        return { role: member.role, ownerId: workspace.ownerId };
    }
    async createProject(workspaceId, userId, data) {
        const workspaceAccess = await this.checkWorkspaceAccess(workspaceId, userId);
        if (!project_permissions_1.ProjectPermissions.canManageProject(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to create projects');
        }
        return this.projectRepository.create({
            workspaceId,
            name: data.name,
            description: data.description,
            color: data.color,
            startDate: data.startDate,
            endDate: data.endDate,
            createdBy: userId,
        });
    }
    async getProjectById(projectId, userId) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new error_1.NotFoundError('Project');
        }
        await (0, project_access_permissions_1.assertProjectAccess)(projectId, userId);
        return project;
    }
    async getWorkspaceProjects(workspaceId, userId) {
        await this.checkWorkspaceAccess(workspaceId, userId);
        const projects = await this.projectRepository.findAllByWorkspace(workspaceId);
        const projectIds = projects.map((project) => project.id);
        const restrictedProjectIds = await prisma_1.prisma.projectMember.groupBy({
            by: ['projectId'],
            where: { projectId: { in: projectIds } },
        });
        if (restrictedProjectIds.length === 0) {
            return projects;
        }
        const accessibleRestrictedProjectIds = new Set();
        for (const restrictedProject of restrictedProjectIds) {
            try {
                await (0, project_access_permissions_1.assertProjectAccess)(restrictedProject.projectId, userId);
                accessibleRestrictedProjectIds.add(restrictedProject.projectId);
            }
            catch {
                // User is not a project member.
            }
        }
        const unrestrictedProjectIds = new Set(projects
            .filter((project) => !restrictedProjectIds.some((member) => member.projectId === project.id))
            .map((project) => project.id));
        return projects.filter((project) => unrestrictedProjectIds.has(project.id) || accessibleRestrictedProjectIds.has(project.id));
    }
    async updateProject(projectId, userId, data) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new error_1.NotFoundError('Project');
        }
        const workspaceAccess = await (0, project_access_permissions_1.assertProjectAccess)(projectId, userId);
        if (!project_permissions_1.ProjectPermissions.canManageProject(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to update this project');
        }
        return this.projectRepository.update(projectId, data);
    }
    async deleteProject(projectId, userId, permanent = false) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new error_1.NotFoundError('Project');
        }
        const workspaceAccess = await (0, project_access_permissions_1.assertProjectAccess)(projectId, userId);
        if (!project_permissions_1.ProjectPermissions.canManageProject(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to delete this project');
        }
        if (permanent) {
            await this.projectRepository.hardDelete(projectId);
        }
        else {
            await this.projectRepository.softDelete(projectId);
        }
    }
    async addProjectMember(projectId, userId, targetUserId) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new error_1.NotFoundError('Project');
        }
        const workspaceAccess = await (0, project_access_permissions_1.assertProjectAccess)(projectId, userId);
        if (!project_permissions_1.ProjectPermissions.canManageProject(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to add members to this project');
        }
        // Check if target user is a workspace member
        const isWorkspaceMember = await prisma_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: project.workspaceId,
                    userId: targetUserId,
                },
            },
        });
        if (!isWorkspaceMember) {
            throw new error_1.ForbiddenError('User must be a workspace member first');
        }
        const isAlreadyMember = await this.projectRepository.findMember(projectId, targetUserId);
        if (isAlreadyMember) {
            throw new error_1.ConflictError('User is already a project member');
        }
        return this.projectRepository.addMember(projectId, targetUserId);
    }
    async removeProjectMember(projectId, userId, targetUserId) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new error_1.NotFoundError('Project');
        }
        const workspaceAccess = await (0, project_access_permissions_1.assertProjectAccess)(projectId, userId);
        if (!project_permissions_1.ProjectPermissions.canManageProject(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to remove members from this project');
        }
        await this.projectRepository.removeMember(projectId, targetUserId);
    }
    async getProjectMembers(projectId, userId) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new error_1.NotFoundError('Project');
        }
        await (0, project_access_permissions_1.assertProjectAccess)(projectId, userId);
        return this.projectRepository.findAllMembers(projectId);
    }
}
exports.ProjectService = ProjectService;
