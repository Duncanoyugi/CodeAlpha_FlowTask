import { prisma } from '../../../src/lib/prisma';
import { Workspace, WorkspaceMember, Role } from '../../generated/prisma';

export class WorkspaceRepository {
  async create(data: {
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    ownerId: string;
  }): Promise<Workspace> {
    return prisma.workspace.create({
      data,
    });
  }

  async findById(id: string): Promise<Workspace | null> {
    return prisma.workspace.findUnique({
      where: { id },
      include: {
        owner: {
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

  async findBySlug(slug: string): Promise<Workspace | null> {
    return prisma.workspace.findUnique({
      where: { slug },
    });
  }

  async findAllByUser(userId: string): Promise<Workspace[]> {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: true,
      },
    });
    return memberships.map((m) => m.workspace);
  }

  async update(id: string, data: Partial<Workspace>): Promise<Workspace> {
    return prisma.workspace.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.workspace.delete({
      where: { id },
    });
  }

  async addMember(data: {
    workspaceId: string;
    userId: string;
    role: Role;
  }): Promise<WorkspaceMember> {
    return prisma.workspaceMember.create({
      data,
    });
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    role: Role,
  ): Promise<WorkspaceMember> {
    return prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      data: { role },
    });
  }

  async findMember(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember | null> {
    return prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
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

async findAllMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async isMember(workspaceId: string, userId: string): Promise<boolean> {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
    return !!member;
  }

  async getOwnerId(workspaceId: string): Promise<string | null> {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });
    return workspace?.ownerId || null;
  }
}