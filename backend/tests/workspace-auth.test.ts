import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkspaceService } from '../src/modules/workspaces/workspace.service';
import { ForbiddenError } from '../src/utils/error';
import { prisma } from '../src/lib/prisma';

describe('workspace create authorization', () => {
  const workspaceService = new WorkspaceService();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects workspace creation for member users', async () => {
    vi.spyOn(prisma.workspaceMember, 'findMany').mockResolvedValue([
      {
        workspaceId: 'workspace-1',
        userId: 'user-1',
        role: 'MEMBER',
        createdAt: new Date(),
        updatedAt: new Date(),
        workspace: { ownerId: 'owner-1' },
      } as any,
    ]);

    await expect(workspaceService.createWorkspace('user-1', { name: 'New Workspace' } as any)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('allows workspace creation for admins', async () => {
    vi.spyOn(prisma.workspaceMember, 'findMany').mockResolvedValue([
      {
        workspaceId: 'workspace-1',
        userId: 'user-1',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
        workspace: { ownerId: 'owner-1' },
      } as any,
    ]);
    vi.spyOn(prisma.workspace, 'findUnique').mockResolvedValue(null);
    vi.spyOn(prisma.workspace, 'create').mockResolvedValue({
      id: 'workspace-2',
      name: 'New Workspace',
      slug: 'new-workspace',
      description: null,
      logo: null,
      ownerId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    vi.spyOn(prisma.workspaceMember, 'create').mockResolvedValue({
      id: 'member-1',
      workspaceId: 'workspace-2',
      userId: 'user-1',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    await expect(workspaceService.createWorkspace('user-1', { name: 'New Workspace' } as any)).resolves.toMatchObject({ name: 'New Workspace' });
  });
});
