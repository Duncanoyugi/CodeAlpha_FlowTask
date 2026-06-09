import { ProjectRepository } from './project.repository';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { NotFoundError, ForbiddenError, ConflictError } from '../../../src/utils/error';
import { Role } from '../../generated/prisma';
import { prisma } from '../../../src/lib/prisma';

export class ProjectService {
  private projectRepository: ProjectRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  private async checkWorkspaceAccess(workspaceId: string, userId: string): Promise<Role> {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenError('You do not have access to this workspace');
    }

    return member.role;
  }

  async createProject(
    workspaceId: string,
    userId: string,
    data: CreateProjectDto,
  ) {
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

  async getProjectById(projectId: string, userId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    const workspaceId = await this.projectRepository.getWorkspaceId(projectId);
    await this.checkWorkspaceAccess(workspaceId!, userId);

    return project;
  }

  async getWorkspaceProjects(workspaceId: string, userId: string) {
    await this.checkWorkspaceAccess(workspaceId, userId);
    return this.projectRepository.findAllByWorkspace(workspaceId);
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

    const userRole = await this.checkWorkspaceAccess(project.workspaceId, userId);
    
    // Only ADMIN or project creator can update
    if (userRole !== Role.ADMIN && project.createdBy !== userId) {
      throw new ForbiddenError('You do not have permission to update this project');
    }

    return this.projectRepository.update(projectId, data);
  }

  async deleteProject(projectId: string, userId: string, permanent = false) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    const userRole = await this.checkWorkspaceAccess(project.workspaceId, userId);
    
    // Only ADMIN or project creator can delete
    if (userRole !== Role.ADMIN && project.createdBy !== userId) {
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

    const userRole = await this.checkWorkspaceAccess(project.workspaceId, userId);
    
    // Only ADMIN or project creator can add members
    if (userRole !== Role.ADMIN && project.createdBy !== userId) {
      throw new ForbiddenError('You do not have permission to add members to this project');
    }

    // Check if target user is a workspace member
    const isWorkspaceMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: project.workspaceId,
          userId: targetUserId,
        },
      },
    });

    if (!isWorkspaceMember) {
      throw new ForbiddenError('User must be a workspace member first');
    }

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

    const userRole = await this.checkWorkspaceAccess(project.workspaceId, userId);
    
    // Only ADMIN or project creator can remove members
    if (userRole !== Role.ADMIN && project.createdBy !== userId) {
      throw new ForbiddenError('You do not have permission to remove members from this project');
    }

    await this.projectRepository.removeMember(projectId, targetUserId);
  }

  async getProjectMembers(projectId: string, userId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    await this.checkWorkspaceAccess(project.workspaceId, userId);
    
    return this.projectRepository.findAllMembers(projectId);
  }
}