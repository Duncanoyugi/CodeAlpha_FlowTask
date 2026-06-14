"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceService = void 0;
const workspace_repository_1 = require("./workspace.repository");
const error_1 = require("../../../src/utils/error");
const slugify_1 = require("../../../src/utils/slugify");
const prisma_1 = require("../../generated/prisma");
const workspace_permissions_1 = require("./workspace.permissions");
class WorkspaceService {
    workspaceRepository;
    constructor() {
        this.workspaceRepository = new workspace_repository_1.WorkspaceRepository();
    }
    async generateUniqueSlug(name) {
        let slug = (0, slugify_1.slugify)(name);
        let existing = await this.workspaceRepository.findBySlug(slug);
        let counter = 1;
        while (existing) {
            slug = `${(0, slugify_1.slugify)(name)}-${counter}`;
            existing = await this.workspaceRepository.findBySlug(slug);
            counter++;
        }
        return slug;
    }
    async createWorkspace(userId, data) {
        const slug = await this.generateUniqueSlug(data.name);
        const workspace = await this.workspaceRepository.create({
            name: data.name,
            slug,
            description: data.description,
            logo: data.logo,
            ownerId: userId,
        });
        // Add owner as ADMIN member
        await this.workspaceRepository.addMember({
            workspaceId: workspace.id,
            userId,
            role: prisma_1.Role.ADMIN,
        });
        return workspace;
    }
    async getWorkspaceById(workspaceId, userId) {
        const isMember = await this.workspaceRepository.isMember(workspaceId, userId);
        if (!isMember) {
            throw new error_1.ForbiddenError('You do not have access to this workspace');
        }
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new error_1.NotFoundError('Workspace');
        }
        return workspace;
    }
    async getUserWorkspaces(userId) {
        return this.workspaceRepository.findAllByUser(userId);
    }
    async updateWorkspace(workspaceId, userId, userRole, data) {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new error_1.NotFoundError('Workspace');
        }
        if (!workspace_permissions_1.WorkspacePermissions.canUpdateWorkspace(userRole, userId, workspace.ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to update this workspace');
        }
        const updateData = { ...data };
        if (data.name) {
            updateData.slug = await this.generateUniqueSlug(data.name);
        }
        return this.workspaceRepository.update(workspaceId, updateData);
    }
    async deleteWorkspace(workspaceId, userId) {
        const ownerId = await this.workspaceRepository.getOwnerId(workspaceId);
        if (!ownerId || !workspace_permissions_1.WorkspacePermissions.canDeleteWorkspace(userId, ownerId)) {
            throw new error_1.ForbiddenError('Only the workspace owner can delete the workspace');
        }
        await this.workspaceRepository.delete(workspaceId);
    }
    async transferOwnership(workspaceId, userId, newOwnerId) {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new error_1.NotFoundError('Workspace');
        }
        if (!workspace_permissions_1.WorkspacePermissions.canTransferOwnership(userId, workspace.ownerId)) {
            throw new error_1.ForbiddenError('Only the workspace owner can transfer ownership');
        }
        if (newOwnerId === workspace.ownerId) {
            throw new error_1.BadRequestError('Workspace ownership is already assigned to this user');
        }
        const targetMember = await this.workspaceRepository.findMember(workspaceId, newOwnerId);
        if (!targetMember) {
            throw new error_1.NotFoundError('Member');
        }
        await this.workspaceRepository.update(workspaceId, { ownerId: newOwnerId });
        await this.workspaceRepository.updateMemberRole(workspaceId, workspace.ownerId, prisma_1.Role.ADMIN);
        await this.workspaceRepository.updateMemberRole(workspaceId, newOwnerId, prisma_1.Role.ADMIN);
        return this.workspaceRepository.findById(workspaceId);
    }
    async addMember(workspaceId, userId, userRole, targetEmail, role) {
        if (!workspace_permissions_1.WorkspacePermissions.canInviteMembers(userRole)) {
            throw new error_1.ForbiddenError('You do not have permission to invite members');
        }
        // This will be implemented with invites in Step 5
        // For now, we'll add directly (simplified)
        const isMember = await this.workspaceRepository.isMember(workspaceId, userId);
        if (isMember) {
            throw new error_1.ConflictError('User is already a member');
        }
        return this.workspaceRepository.addMember({
            workspaceId,
            userId,
            role,
        });
    }
    async removeMember(workspaceId, currentUserId, targetUserId) {
        const currentMember = await this.workspaceRepository.findMember(workspaceId, currentUserId);
        const targetMember = await this.workspaceRepository.findMember(workspaceId, targetUserId);
        const ownerId = await this.workspaceRepository.getOwnerId(workspaceId);
        if (!currentMember || !targetMember || !ownerId) {
            throw new error_1.NotFoundError('Member');
        }
        if (!workspace_permissions_1.WorkspacePermissions.canRemoveMember(currentMember.role, currentUserId, targetUserId, ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to remove this member');
        }
        await this.workspaceRepository.removeMember(workspaceId, targetUserId);
    }
    async updateMemberRole(workspaceId, currentUserId, targetUserId, newRole) {
        const currentMember = await this.workspaceRepository.findMember(workspaceId, currentUserId);
        const targetMember = await this.workspaceRepository.findMember(workspaceId, targetUserId);
        const ownerId = await this.workspaceRepository.getOwnerId(workspaceId);
        if (!currentMember || !targetMember || !ownerId) {
            throw new error_1.NotFoundError('Member');
        }
        if (!workspace_permissions_1.WorkspacePermissions.canChangeRole(currentMember.role, currentUserId, targetUserId, ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to change this member\'s role');
        }
        return this.workspaceRepository.updateMemberRole(workspaceId, targetUserId, newRole);
    }
    async getWorkspaceMembers(workspaceId, userId) {
        const isMember = await this.workspaceRepository.isMember(workspaceId, userId);
        if (!isMember) {
            throw new error_1.ForbiddenError('You do not have access to this workspace');
        }
        return this.workspaceRepository.findAllMembers(workspaceId);
    }
}
exports.WorkspaceService = WorkspaceService;
