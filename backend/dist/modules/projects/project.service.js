"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const project_repository_1 = require("./project.repository");
const error_1 = require("../../../src/utils/error");
const prisma_1 = require("../../generated/prisma");
const prisma_2 = require("../../../src/lib/prisma");
class ProjectService {
    projectRepository;
    constructor() {
        this.projectRepository = new project_repository_1.ProjectRepository();
    }
    async checkWorkspaceAccess(workspaceId, userId) {
        const member = await prisma_2.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
        });
        if (!member) {
            throw new error_1.ForbiddenError('You do not have access to this workspace');
        }
        return member.role;
    }
    async createProject(workspaceId, userId, data) {
        await this.checkWorkspaceAccess(workspaceId, userId);
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
        const workspaceId = await this.projectRepository.getWorkspaceId(projectId);
        await this.checkWorkspaceAccess(workspaceId, userId);
        return project;
    }
    async getWorkspaceProjects(workspaceId, userId) {
        await this.checkWorkspaceAccess(workspaceId, userId);
        return this.projectRepository.findAllByWorkspace(workspaceId);
    }
    async updateProject(projectId, userId, data) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new error_1.NotFoundError('Project');
        }
        const userRole = await this.checkWorkspaceAccess(project.workspaceId, userId);
        // Only ADMIN or project creator can update
        if (userRole !== prisma_1.Role.ADMIN && project.createdBy !== userId) {
            throw new error_1.ForbiddenError('You do not have permission to update this project');
        }
        return this.projectRepository.update(projectId, data);
    }
    async deleteProject(projectId, userId, permanent = false) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new error_1.NotFoundError('Project');
        }
        const userRole = await this.checkWorkspaceAccess(project.workspaceId, userId);
        // Only ADMIN or project creator can delete
        if (userRole !== prisma_1.Role.ADMIN && project.createdBy !== userId) {
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
        const userRole = await this.checkWorkspaceAccess(project.workspaceId, userId);
        // Only ADMIN or project creator can add members
        if (userRole !== prisma_1.Role.ADMIN && project.createdBy !== userId) {
            throw new error_1.ForbiddenError('You do not have permission to add members to this project');
        }
        // Check if target user is a workspace member
        const isWorkspaceMember = await prisma_2.prisma.workspaceMember.findUnique({
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
        const userRole = await this.checkWorkspaceAccess(project.workspaceId, userId);
        // Only ADMIN or project creator can remove members
        if (userRole !== prisma_1.Role.ADMIN && project.createdBy !== userId) {
            throw new error_1.ForbiddenError('You do not have permission to remove members from this project');
        }
        await this.projectRepository.removeMember(projectId, targetUserId);
    }
    async getProjectMembers(projectId, userId) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new error_1.NotFoundError('Project');
        }
        await this.checkWorkspaceAccess(project.workspaceId, userId);
        return this.projectRepository.findAllMembers(projectId);
    }
}
exports.ProjectService = ProjectService;
