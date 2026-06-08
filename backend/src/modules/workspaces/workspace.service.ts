import { WorkspaceRepository } from './workspace.repository';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './workspace.dto';
import { ConflictError, NotFoundError, ForbiddenError } from '../../../src/utils/error';
import { slugify } from '../../../src/utils/slugify';
import { Role } from '../../generated/prisma';
import { WorkspacePermissions } from './workspace.permissions';

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
      role: Role.ADMIN,
    });
    
    return workspace;
  }

  async getWorkspaceById(workspaceId: string, userId: string) {
    const isMember = await this.workspaceRepository.isMember(workspaceId, userId);
    if (!isMember) {
      throw new ForbiddenError('You do not have access to this workspace');
    }
    
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace');
    }
    
    return workspace;
  }

  async getUserWorkspaces(userId: string) {
    return this.workspaceRepository.findAllByUser(userId);
  }

  async updateWorkspace(
    workspaceId: string,
    userId: string,
    userRole: Role,
    data: UpdateWorkspaceDto,
  ) {
    if (!WorkspacePermissions.canUpdateWorkspace(userRole)) {
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
    
    if (!WorkspacePermissions.canDeleteWorkspace(userId, ownerId!)) {
      throw new ForbiddenError('Only the workspace owner can delete the workspace');
    }
    
    await this.workspaceRepository.delete(workspaceId);
  }

  async addMember(workspaceId: string, userId: string, userRole: Role, targetEmail: string, role: Role) {
    if (!WorkspacePermissions.canInviteMembers(userRole)) {
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
    const currentMember = await this.workspaceRepository.findMember(workspaceId, currentUserId);
    const targetMember = await this.workspaceRepository.findMember(workspaceId, targetUserId);
    const ownerId = await this.workspaceRepository.getOwnerId(workspaceId);
    
    if (!currentMember || !targetMember) {
      throw new NotFoundError('Member');
    }
    
    if (!WorkspacePermissions.canRemoveMember(
      currentMember.role,
      targetMember.role,
      currentUserId,
      targetUserId,
      ownerId!,
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
    const currentMember = await this.workspaceRepository.findMember(workspaceId, currentUserId);
    const targetMember = await this.workspaceRepository.findMember(workspaceId, targetUserId);
    const ownerId = await this.workspaceRepository.getOwnerId(workspaceId);
    
    if (!currentMember || !targetMember) {
      throw new NotFoundError('Member');
    }
    
    if (!WorkspacePermissions.canChangeRole(
      currentMember.role,
      targetMember.role,
      currentUserId,
      targetUserId,
      ownerId!,
    )) {
      throw new ForbiddenError('You do not have permission to change this member\'s role');
    }
    
    return this.workspaceRepository.updateMemberRole(workspaceId, targetUserId, newRole);
  }

  async getWorkspaceMembers(workspaceId: string, userId: string) {
    const isMember = await this.workspaceRepository.isMember(workspaceId, userId);
    if (!isMember) {
      throw new ForbiddenError('You do not have access to this workspace');
    }
    
    return this.workspaceRepository.findAllMembers(workspaceId);
  }
}