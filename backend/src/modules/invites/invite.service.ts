import { InviteRepository } from './invite.repository';
import { CreateInviteDto } from './invite.dto';
import { ConflictError, NotFoundError, ForbiddenError, BadRequestError } from '../../../src/utils/error';
import { prisma } from '../../../src/lib/prisma';
import { Role } from '../../generated/prisma';
import crypto from 'crypto';
import { NotificationService } from '../notifications/notification.service';

export class InviteService {
  private inviteRepository: InviteRepository;
  private notificationService: NotificationService;

  constructor() {
    this.inviteRepository = new InviteRepository();
    this.notificationService = new NotificationService();
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
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

    if (member.role !== Role.ADMIN) {
      throw new ForbiddenError('Only workspace admins can invite members');
    }

    return member.role;
  }

  async createInvite(workspaceId: string, userId: string, data: CreateInviteDto) {
    await this.checkWorkspaceAccess(workspaceId, userId);

    // Check if user is already a member
    const existingMember = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        workspaces: {
          where: { workspaceId },
        },
      },
    });

    if (existingMember && existingMember.workspaces.length > 0) {
      throw new ConflictError('User is already a member of this workspace');
    }

    // Check if there's already a pending invite
    const existingInvite = await this.inviteRepository.findByEmailAndWorkspace(
      data.email,
      workspaceId,
    );

    if (existingInvite) {
      throw new ConflictError('An invite has already been sent to this email');
    }

    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const invite = await this.inviteRepository.create({
      workspaceId,
      email: data.email,
      token,
      role: data.role || Role.MEMBER,
      expiresAt,
      createdBy: userId,
    });

    // TODO: Send email with invite link
    // For now, just return the invite with token
    // Email would contain: `${FRONTEND_URL}/invite?token=${token}`

    return invite;
  }

  async getInviteByToken(token: string) {
    const invite = await this.inviteRepository.findByToken(token);
    
    if (!invite) {
      throw new NotFoundError('Invite');
    }
    
    if (invite.expiresAt < new Date()) {
      throw new BadRequestError('Invite has expired');
    }
    
    if (invite.acceptedAt) {
      throw new BadRequestError('Invite has already been accepted');
    }
    
    return invite;
  }

  async acceptInvite(token: string, userId: string) {
    const invite = await this.inviteRepository.findByToken(token);
    
    if (!invite) {
      throw new NotFoundError('Invite');
    }
    
    if (invite.expiresAt < new Date()) {
      throw new BadRequestError('Invite has expired');
    }
    
    if (invite.acceptedAt) {
      throw new BadRequestError('Invite has already been accepted');
    }
    
    // Check if user already exists and is a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: invite.workspaceId,
          userId,
        },
      },
    });
    
    if (existingMember) {
      throw new ConflictError('You are already a member of this workspace');
    }
    
    // Add user to workspace
    await prisma.workspaceMember.create({
      data: {
        workspaceId: invite.workspaceId,
        userId,
        role: invite.role,
      },
    });
    
    // Mark invite as accepted
    await this.inviteRepository.acceptInvite(token, userId);
    
    // Notify the workspace creator
    const workspace = await prisma.workspace.findUnique({
      where: { id: invite.workspaceId },
      include: {
        owner: true,
      },
    });
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (workspace && user) {
      await this.notificationService.notifyMemberJoined(
        workspace.id,
        workspace.name,
        `${user.firstName} ${user.lastName}`,
        workspace.ownerId,
      );
    }
    
    return { workspaceId: invite.workspaceId, role: invite.role };
  }

  async getWorkspaceInvites(workspaceId: string, userId: string) {
    await this.checkWorkspaceAccess(workspaceId, userId);
    return this.inviteRepository.findAllByWorkspace(workspaceId);
  }

  async revokeInvite(workspaceId: string, userId: string, inviteId: string) {
    await this.checkWorkspaceAccess(workspaceId, userId);
    
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
    });
    
    if (!invite || invite.workspaceId !== workspaceId) {
      throw new NotFoundError('Invite');
    }
    
    if (invite.acceptedAt) {
      throw new BadRequestError('Cannot revoke an already accepted invite');
    }
    
    await this.inviteRepository.deleteInvite(inviteId);
  }
}