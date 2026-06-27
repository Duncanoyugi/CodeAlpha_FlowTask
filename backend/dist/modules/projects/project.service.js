"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const project_repository_1 = require("./project.repository");
const error_1 = require("../../../src/utils/error");
const project_permissions_1 = require("../../../src/permissions/project.permissions");
const access_resolver_1 = require("../../../src/permissions/access-resolver");
class ProjectService {
    projectRepository;
    constructor() {
        this.projectRepository = new project_repository_1.ProjectRepository();
    }
    async createProject(workspaceId, userId, data) {
        const workspaceAccess = await (0, access_resolver_1.resolveWorkspaceAccess)(workspaceId, userId);
        if (!project_permissions_1.ProjectPermissions.canManageProject(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
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
        await (0, access_resolver_1.resolveProjectAccess)(projectId, userId);
        return project;
    }
    async getWorkspaceProjects(workspaceId, userId) {
        const accessibleProjectIds = await (0, access_resolver_1.resolveAccessibleProjectIds)(workspaceId, userId);
        const accessibleSet = new Set(accessibleProjectIds);
        const projects = await this.projectRepository.findAllByWorkspace(workspaceId);
        return projects.filter((project) => accessibleSet.has(project.id));
    }
    async updateProject(projectId, userId, data) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new error_1.NotFoundError('Project');
        }
        const workspaceAccess = await (0, access_resolver_1.resolveProjectAccess)(projectId, userId);
        if (!project_permissions_1.ProjectPermissions.canManageProject(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to update this project');
        }
        return this.projectRepository.update(projectId, data);
    }
    async deleteProject(projectId, userId, permanent = false) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new error_1.NotFoundError('Project');
        }
        const workspaceAccess = await (0, access_resolver_1.resolveProjectAccess)(projectId, userId);
        if (!project_permissions_1.ProjectPermissions.canManageProject(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
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
        const workspaceAccess = await (0, access_resolver_1.resolveProjectAccess)(projectId, userId);
        if (!project_permissions_1.ProjectPermissions.canManageProject(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to add members to this project');
        }
        await (0, access_resolver_1.resolveWorkspaceAccess)(project.workspaceId, targetUserId);
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
        const workspaceAccess = await (0, access_resolver_1.resolveProjectAccess)(projectId, userId);
        if (!project_permissions_1.ProjectPermissions.canManageProject(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to remove members from this project');
        }
        await this.projectRepository.removeMember(projectId, targetUserId);
    }
    async getProjectMembers(projectId, userId) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new error_1.NotFoundError('Project');
        }
        await (0, access_resolver_1.resolveProjectAccess)(projectId, userId);
        return this.projectRepository.findAllMembers(projectId);
    }
}
exports.ProjectService = ProjectService;
