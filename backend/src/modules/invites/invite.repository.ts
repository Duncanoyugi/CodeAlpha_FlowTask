import { prisma } from '../../../src/lib/prisma';
import { Invite, Role } from '../../generated/prisma';

export class InviteRepository {
  async create(data: {
    workspaceId: string;
    email?: string;
    token: string;
    role: Role;
    expiresAt: Date;
    createdBy: string;
  }): Promise<Invite> {
    return prisma.invite.create({
      data,
    });
  }

  async findByToken(token: string): Promise<Invite | null> {
    const result = await prisma.invite.findUnique({
      where: { token },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    return result as Invite & { workspace?: { id: string; name: string; slug: string; logo: string | null }; creator?: { id: string; firstName: string; lastName: string; email: string } } | null;
  }

  async findByEmailAndWorkspace(email: string, workspaceId: string): Promise<Invite | null> {
    return prisma.invite.findFirst({
      where: {
        email,
        workspaceId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async findAllByWorkspace(workspaceId: string): Promise<Invite[]> {
    return prisma.invite.findMany({
      where: { workspaceId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acceptInvite(token: string, recipientId: string): Promise<Invite> {
    return prisma.invite.update({
      where: { token },
      data: {
        acceptedAt: new Date(),
        recipientId,
      },
    });
  }

  async deleteExpiredInvites(): Promise<void> {
    await prisma.invite.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        acceptedAt: null,
      },
    });
  }

  async deleteInvite(id: string): Promise<void> {
    await prisma.invite.delete({
      where: { id },
    });
  }
}