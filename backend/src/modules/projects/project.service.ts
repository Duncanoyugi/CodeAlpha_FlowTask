import { ProjectRepository } from './project.repository';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { NotFoundError, ForbiddenError, ConflictError } from '../../../src/utils/error';
import { prisma } from '../../../src/lib/prisma';
import { ProjectPermissions } from '../../../src/permissions/project.permissions';
import {
  resolveProjectAccess,
  resolveWorkspaceAccess,
  resolveAccessibleProjectIds,
} from '../../../src/permissions/access-resolver';

export class ProjectService {
  private projectRepository: ProjectRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  async createProject(
    workspaceId: string,
    userId: string,
    data: CreateProjectDto,
  ) {
    const workspaceAccess = await resolveWorkspaceAccess(workspaceId, userId);
    if (!ProjectPermissions.canManageProject(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to create projects');
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

  async getProjectById(projectId: string, userId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    await resolveProjectAccess(projectId, userId);

    return project;
  }

  async getWorkspaceProjects(workspaceId: string, userId: string) {
    const accessibleProjectIds = await resolveAccessibleProjectIds(workspaceId, userId);
    const accessibleSet = new Set(accessibleProjectIds);

    const projects = await this.projectRepository.findAllByWorkspace(workspaceId);
    return projects.filter((project) => accessibleSet.has(project.id));
  }

  async updateProject(
    projectId: string,
    userId: string,
    data: UpdateProjectDto,
  ) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    const workspaceAccess = await resolveProjectAccess(projectId, userId);

    if (!ProjectPermissions.canManageProject(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to update this project');
    }

    return this.projectRepository.update(projectId, data);
  }

  async deleteProject(projectId: string, userId: string, permanent = false) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    const workspaceAccess = await resolveProjectAccess(projectId, userId);

    if (!ProjectPermissions.canManageProject(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to delete this project');
    }

    if (permanent) {
      await this.projectRepository.hardDelete(projectId);
    } else {
      await this.projectRepository.softDelete(projectId);
    }
  }

  async addProjectMember(projectId: string, userId: string, targetUserId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    const workspaceAccess = await resolveProjectAccess(projectId, userId);

    if (!ProjectPermissions.canManageProject(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to add members to this project');
    }

    await resolveWorkspaceAccess(project.workspaceId, targetUserId);

    const isAlreadyMember = await this.projectRepository.findMember(projectId, targetUserId);
    if (isAlreadyMember) {
      throw new ConflictError('User is already a project member');
    }

    return this.projectRepository.addMember(projectId, targetUserId);
  }

  async removeProjectMember(projectId: string, userId: string, targetUserId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    const workspaceAccess = await resolveProjectAccess(projectId, userId);

    if (!ProjectPermissions.canManageProject(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to remove members from this project');
    }

    await this.projectRepository.removeMember(projectId, targetUserId);
  }

  async getProjectMembers(projectId: string, userId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    await resolveProjectAccess(projectId, userId);

    return this.projectRepository.findAllMembers(projectId);
  }
}
