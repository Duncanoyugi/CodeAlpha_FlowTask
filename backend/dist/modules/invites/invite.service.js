"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteService = void 0;
const invite_repository_1 = require("./invite.repository");
const error_1 = require("../../../src/utils/error");
const prisma_1 = require("../../../src/lib/prisma");
const prisma_2 = require("../../generated/prisma");
const crypto_1 = __importDefault(require("crypto"));
const notification_service_1 = require("../notifications/notification.service");
class InviteService {
    inviteRepository;
    notificationService;
    constructor() {
        this.inviteRepository = new invite_repository_1.InviteRepository();
        this.notificationService = new notification_service_1.NotificationService();
    }
    generateToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    async checkWorkspaceAccess(workspaceId, userId) {
        const member = await prisma_1.prisma.workspaceMember.findUnique({
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
        if (member.role !== prisma_2.Role.ADMIN) {
            throw new error_1.ForbiddenError('Only workspace admins can invite members');
        }
        return member.role;
    }
    async createInvite(workspaceId, userId, data) {
        await this.checkWorkspaceAccess(workspaceId, userId);
        // Check if user is already a member
        const existingMember = await prisma_1.prisma.user.findUnique({
            where: { email: data.email },
            include: {
                workspaces: {
                    where: { workspaceId },
                },
            },
        });
        if (existingMember && existingMember.workspaces.length > 0) {
            throw new error_1.ConflictError('User is already a member of this workspace');
        }
        // Check if there's already a pending invite
        const existingInvite = await this.inviteRepository.findByEmailAndWorkspace(data.email, workspaceId);
        if (existingInvite) {
            throw new error_1.ConflictError('An invite has already been sent to this email');
        }
        const token = this.generateToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration
        const invite = await this.inviteRepository.create({
            workspaceId,
            email: data.email,
            token,
            role: data.role || prisma_2.Role.MEMBER,
            expiresAt,
            createdBy: userId,
        });
        // TODO: Send email with invite link
        // For now, just return the invite with token
        // Email would contain: `${FRONTEND_URL}/invite?token=${token}`
        return invite;
    }
    async getInviteByToken(token) {
        const invite = await this.inviteRepository.findByToken(token);
        if (!invite) {
            throw new error_1.NotFoundError('Invite');
        }
        if (invite.expiresAt < new Date()) {
            throw new error_1.BadRequestError('Invite has expired');
        }
        if (invite.acceptedAt) {
            throw new error_1.BadRequestError('Invite has already been accepted');
        }
        return invite;
    }
    async acceptInvite(token, userId) {
        const invite = await this.inviteRepository.findByToken(token);
        if (!invite) {
            throw new error_1.NotFoundError('Invite');
        }
        if (invite.expiresAt < new Date()) {
            throw new error_1.BadRequestError('Invite has expired');
        }
        if (invite.acceptedAt) {
            throw new error_1.BadRequestError('Invite has already been accepted');
        }
        // Check if user already exists and is a member
        const existingMember = await prisma_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: invite.workspaceId,
                    userId,
                },
            },
        });
        if (existingMember) {
            throw new error_1.ConflictError('You are already a member of this workspace');
        }
        // Add user to workspace
        await prisma_1.prisma.workspaceMember.create({
            data: {
                workspaceId: invite.workspaceId,
                userId,
                role: invite.role,
            },
        });
        // Mark invite as accepted
        await this.inviteRepository.acceptInvite(token, userId);
        // Notify the workspace creator
        const workspace = await prisma_1.prisma.workspace.findUnique({
            where: { id: invite.workspaceId },
            include: {
                owner: true,
            },
        });
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (workspace && user) {
            await this.notificationService.notifyMemberJoined(workspace.id, workspace.name, `${user.firstName} ${user.lastName}`, workspace.ownerId);
        }
        return { workspaceId: invite.workspaceId, role: invite.role };
    }
    async getWorkspaceInvites(workspaceId, userId) {
        await this.checkWorkspaceAccess(workspaceId, userId);
        return this.inviteRepository.findAllByWorkspace(workspaceId);
    }
    async revokeInvite(workspaceId, userId, inviteId) {
        await this.checkWorkspaceAccess(workspaceId, userId);
        const invite = await prisma_1.prisma.invite.findUnique({
            where: { id: inviteId },
        });
        if (!invite || invite.workspaceId !== workspaceId) {
            throw new error_1.NotFoundError('Invite');
        }
        if (invite.acceptedAt) {
            throw new error_1.BadRequestError('Cannot revoke an already accepted invite');
        }
        await this.inviteRepository.deleteInvite(inviteId);
    }
}
exports.InviteService = InviteService;
