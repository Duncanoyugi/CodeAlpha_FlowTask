import { prisma } from '../../../src/lib/prisma';
import { Project, ProjectMember } from '../../generated/prisma';

export class ProjectRepository {
  async create(data: {
    workspaceId: string;
    name: string;
    description?: string;
    color?: string;
    startDate?: Date;
    endDate?: Date;
    createdBy: string;
  }): Promise<Project> {
    return prisma.project.create({
      data,
    });
  }

  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        boards: {
          select: {
            id: true,
            name: true,
            _count: {
              select: { tasks: true },
            },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async findAllByWorkspace(workspaceId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { workspaceId, deletedAt: null },
      include: {
        boards: {
          select: {
            id: true,
            name: true,
            _count: {
              select: { tasks: true },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Partial<Project>): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await prisma.project.delete({
      where: { id },
    });
  }

  async addMember(projectId: string, userId: string): Promise<ProjectMember> {
    return prisma.projectMember.create({
      data: {
        projectId,
        userId,
      },
    });
  }

  async removeMember(projectId: string, userId: string): Promise<void> {
    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }

  async findMember(projectId: string, userId: string): Promise<ProjectMember | null> {
    return prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }

  async findAllMembers(projectId: string): Promise<ProjectMember[]> {
    return prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async isMember(projectId: string, userId: string): Promise<boolean> {
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
    return !!member;
  }

  async getWorkspaceId(projectId: string): Promise<string | null> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true },
    });
    return project?.workspaceId || null;
  }
}