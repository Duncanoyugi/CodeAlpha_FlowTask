import { ProjectRepository } from './project.repository';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { NotFoundError, ForbiddenError, ConflictError } from '../../../src/utils/error';
import { Role } from '../../generated/prisma';
import { prisma } from '../../../src/lib/prisma';
import { ProjectPermissions } from '../../../src/permissions/project.permissions';
import { assertProjectAccess } from '../../../src/permissions/project-access.permissions';

export class ProjectService {
  private projectRepository: ProjectRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  private async checkWorkspaceAccess(workspaceId: string, userId: string): Promise<{ role: Role; ownerId: string }> {
    const [member, workspace] = await Promise.all([
      prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
      }),
      prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { ownerId: true },
      }),
    ]);

    if (!member || !workspace) {
      throw new ForbiddenError('You do not have access to this workspace');
    }

    return { role: member.role, ownerId: workspace.ownerId };
  }

  async createProject(
    workspaceId: string,
    userId: string,
    data: CreateProjectDto,
  ) {
    const workspaceAccess = await this.checkWorkspaceAccess(workspaceId, userId);
    if (!ProjectPermissions.canManageProject(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
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

    await assertProjectAccess(projectId, userId);

    return project;
  }

  async getWorkspaceProjects(workspaceId: string, userId: string) {
    await this.checkWorkspaceAccess(workspaceId, userId);

    const projects = await this.projectRepository.findAllByWorkspace(workspaceId);
    const projectIds = projects.map((project) => project.id);
    const restrictedProjectIds = await prisma.projectMember.groupBy({
      by: ['projectId'],
      where: { projectId: { in: projectIds } },
    });

    if (restrictedProjectIds.length === 0) {
      return projects;
    }

    const accessibleRestrictedProjectIds = new Set<string>();
    for (const restrictedProject of restrictedProjectIds) {
      try {
        await assertProjectAccess(restrictedProject.projectId, userId);
        accessibleRestrictedProjectIds.add(restrictedProject.projectId);
      } catch {
        // User is not a project member.
      }
    }

    const unrestrictedProjectIds = new Set(
      projects
        .filter((project) => !restrictedProjectIds.some((member) => member.projectId === project.id))
        .map((project) => project.id)
    );

    return projects.filter((project) =>
      unrestrictedProjectIds.has(project.id) || accessibleRestrictedProjectIds.has(project.id)
    );
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

    const workspaceAccess = await assertProjectAccess(projectId, userId);
    
    if (!ProjectPermissions.canManageProject(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to update this project');
    }

    return this.projectRepository.update(projectId, data);
  }

  async deleteProject(projectId: string, userId: string, permanent = false) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    const workspaceAccess = await assertProjectAccess(projectId, userId);
    
    if (!ProjectPermissions.canManageProject(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
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

    const workspaceAccess = await assertProjectAccess(projectId, userId);
    
    if (!ProjectPermissions.canManageProject(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
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

    const workspaceAccess = await assertProjectAccess(projectId, userId);
    
    if (!ProjectPermissions.canManageProject(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to remove members from this project');
    }

    await this.projectRepository.removeMember(projectId, targetUserId);
  }

  async getProjectMembers(projectId: string, userId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    await assertProjectAccess(projectId, userId);
    
    return this.projectRepository.findAllMembers(projectId);
  }
}