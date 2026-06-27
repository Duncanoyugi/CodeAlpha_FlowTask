import { WorkspaceRepository } from './workspace.repository';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './workspace.dto';
import { ConflictError, NotFoundError, ForbiddenError, BadRequestError } from '../../../src/utils/error';
import { slugify } from '../../../src/utils/slugify';
import { Role } from '../../generated/prisma';
import { WorkspacePermissions } from './workspace.permissions';
import { resolveWorkspaceAccess } from '../../permissions/access-resolver';

export class WorkspaceService {
  private workspaceRepository: WorkspaceRepository;

  constructor() {
    this.workspaceRepository = new WorkspaceRepository();
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = slugify(name);
    let existing = await this.workspaceRepository.findBySlug(slug);
    let counter = 1;
    
    while (existing) {
      slug = `${slugify(name)}-${counter}`;
      existing = await this.workspaceRepository.findBySlug(slug);
      counter++;
    }
    
    return slug;
  }

  async createWorkspace(userId: string, data: CreateWorkspaceDto) {
    // Authorization for creating a workspace must be enforced server-side.
    // This codebase models permissions at the workspace-membership level.

    // If the user is already a member of any workspace, their membership role
    // determines whether they can create additional workspaces.
    const memberships = await this.workspaceRepository.findAllByUser(userId);

    // Capability matrix: MEMBER/VIEWER cannot create workspaces.
    // We therefore allow creation only if the user is a workspace ADMIN (or first-time bootstrap).
    if (memberships.length > 0) {
      // For current schema we can infer role by checking their membership in any workspace.
      // WorkspaceRepository does not expose a dedicated membership-role lookup,
      // so we fetch one member record by scanning existing memberships.
      // (No client-supplied role is trusted.)
      const exampleWorkspace = memberships[0];
      const member = await this.workspaceRepository.findMember(exampleWorkspace.id, userId);

      if (!member || member.role !== Role.ADMIN) {
        throw new ForbiddenError('You do not have permission to create workspaces');
      }
    }

    const slug = await this.generateUniqueSlug(data.name);

    const workspace = await this.workspaceRepository.create({
      name: data.name,
      slug,
      description: data.description,
      logo: data.logo,
      ownerId: userId,
    });

    // Add owner as ADMIN member (storage role). EffectiveRole is computed as OWNER for the ownerId.
    await this.workspaceRepository.addMember({
      workspaceId: workspace.id,
      userId,
      role: Role.ADMIN,
    });

    return workspace;
  }

  async getWorkspaceById(workspaceId: string, userId: string) {
    const access = await resolveWorkspaceAccess(workspaceId, userId);

    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace');
    }

    return {
      ...workspace,
      currentUserRole: access.effectiveRole,
    };
  }

  async getUserWorkspaces(userId: string) {
    const workspaces = await this.workspaceRepository.findAllByUser(userId);

    return Promise.all(
      workspaces.map(async (workspace) => {
        const access = await resolveWorkspaceAccess(workspace.id, userId);
        return {
          ...workspace,
          currentUserRole: access.effectiveRole,
        };
      }),
    );
  }

  async updateWorkspace(
    workspaceId: string,
    userId: string,
    userRole: Role,
    data: UpdateWorkspaceDto,
  ) {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace');
    }

    const access = await resolveWorkspaceAccess(workspaceId, userId);
    const roleForPermissions = access.permissionRole;

    if (!WorkspacePermissions.canUpdateWorkspace(roleForPermissions, userId, workspace.ownerId)) {
      throw new ForbiddenError('You do not have permission to update this workspace');
    }
    
    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = await this.generateUniqueSlug(data.name);
    }
    
    return this.workspaceRepository.update(workspaceId, updateData);
  }

  async deleteWorkspace(workspaceId: string, userId: string) {
    const ownerId = await this.workspaceRepository.getOwnerId(workspaceId);
    
    if (!ownerId || !WorkspacePermissions.canDeleteWorkspace(userId, ownerId)) {
      throw new ForbiddenError('Only the workspace owner can delete the workspace');
    }
    
    await this.workspaceRepository.delete(workspaceId);
  }

  async transferOwnership(workspaceId: string, userId: string, newOwnerId: string) {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace');
    }

    if (!WorkspacePermissions.canTransferOwnership(userId, workspace.ownerId)) {
      throw new ForbiddenError('Only the workspace owner can transfer ownership');
    }

    if (newOwnerId === workspace.ownerId) {
      throw new BadRequestError('Workspace ownership is already assigned to this user');
    }

    const targetMember = await this.workspaceRepository.findMember(workspaceId, newOwnerId);
    if (!targetMember) {
      throw new NotFoundError('Member');
    }

    await this.workspaceRepository.update(workspaceId, { ownerId: newOwnerId });
    await this.workspaceRepository.updateMemberRole(workspaceId, workspace.ownerId, Role.ADMIN);
    await this.workspaceRepository.updateMemberRole(workspaceId, newOwnerId, Role.ADMIN);

    return this.workspaceRepository.findById(workspaceId);
  }

  async addMember(workspaceId: string, userId: string, userRole: Role, targetEmail: string, role: Role) {
    const access = await resolveWorkspaceAccess(workspaceId, userId);
    if (!WorkspacePermissions.canInviteMembers(access.permissionRole)) {
      throw new ForbiddenError('You do not have permission to invite members');
    }

    // This will be implemented with invites in Step 5
    // For now, we'll add directly (simplified)
    const isMember = await this.workspaceRepository.isMember(workspaceId, userId);
    if (isMember) {
      throw new ConflictError('User is already a member');
    }
    
    return this.workspaceRepository.addMember({
      workspaceId,
      userId,
      role,
    });
  }

  async removeMember(workspaceId: string, currentUserId: string, targetUserId: string) {
    const access = await resolveWorkspaceAccess(workspaceId, currentUserId);
    const targetMember = await this.workspaceRepository.findMember(workspaceId, targetUserId);

    if (!targetMember) {
      throw new NotFoundError('Member');
    }

    if (!WorkspacePermissions.canRemoveMember(
      access.permissionRole,
      currentUserId,
      targetUserId,
      access.ownerId,
    )) {
      throw new ForbiddenError('You do not have permission to remove this member');
    }
    
    await this.workspaceRepository.removeMember(workspaceId, targetUserId);
  }

  async updateMemberRole(
    workspaceId: string,
    currentUserId: string,
    targetUserId: string,
    newRole: Role,
  ) {
    const access = await resolveWorkspaceAccess(workspaceId, currentUserId);
    const targetMember = await this.workspaceRepository.findMember(workspaceId, targetUserId);

    if (!targetMember) {
      throw new NotFoundError('Member');
    }

    if (!WorkspacePermissions.canChangeRole(
      access.permissionRole,
      currentUserId,
      targetUserId,
      access.ownerId,
    )) {
      throw new ForbiddenError('You do not have permission to change this member\'s role');
    }
    
    return this.workspaceRepository.updateMemberRole(workspaceId, targetUserId, newRole);
  }

  async getWorkspaceMembers(workspaceId: string, userId: string) {
    await resolveWorkspaceAccess(workspaceId, userId);

    return this.workspaceRepository.findAllMembers(workspaceId);
  }
}