import { prisma } from '../lib/prisma';
import { Role } from '../generated/prisma';
import { ForbiddenError, NotFoundError } from '../utils/error';
import {
  computeEffectiveRole,
  EffectiveRole,
  toPermissionRole,
} from './effective-role';

export type { EffectiveRole };
export { computeEffectiveRole, toPermissionRole };

export interface WorkspaceAccess {
  userId: string;
  workspaceId: string;
  ownerId: string;
  membershipRole: Role;
  effectiveRole: EffectiveRole;
  permissionRole: Role;
}

export interface ProjectAccess extends WorkspaceAccess {
  projectId: string;
}

export interface BoardAccess extends ProjectAccess {
  boardId: string;
}

export interface TaskAccess extends BoardAccess {
  taskId: string;
  reporterId: string;
  assigneeId: string | null;
}

async function loadWorkspaceMembership(
  workspaceId: string,
  userId: string,
): Promise<{ membershipRole: Role; ownerId: string }> {
  const [member, workspace] = await Promise.all([
    prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      select: { role: true },
    }),
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    }),
  ]);

  if (!workspace) {
    throw new NotFoundError('Workspace');
  }

  if (!member) {
    throw new ForbiddenError('You do not have access to this workspace');
  }

  return { membershipRole: member.role, ownerId: workspace.ownerId };
}

function buildWorkspaceAccess(
  userId: string,
  workspaceId: string,
  membershipRole: Role,
  ownerId: string,
): WorkspaceAccess {
  const effectiveRole = computeEffectiveRole(membershipRole, userId, ownerId);
  return {
    userId,
    workspaceId,
    ownerId,
    membershipRole,
    effectiveRole,
    permissionRole: toPermissionRole(effectiveRole),
  };
}

async function assertProjectMembership(
  projectId: string,
  userId: string,
): Promise<void> {
  const projectMembers = await prisma.projectMember.findMany({
    where: { projectId },
    select: { userId: true },
  });

  if (
    projectMembers.length > 0 &&
    !projectMembers.some((member) => member.userId === userId)
  ) {
    throw new ForbiddenError('You do not have access to this project');
  }
}

export async function resolveWorkspaceAccess(
  workspaceId: string,
  userId: string,
): Promise<WorkspaceAccess> {
  const { membershipRole, ownerId } = await loadWorkspaceMembership(workspaceId, userId);
  return buildWorkspaceAccess(userId, workspaceId, membershipRole, ownerId);
}

export async function resolveProjectAccess(
  projectId: string,
  userId: string,
): Promise<ProjectAccess> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true },
  });

  if (!project) {
    throw new NotFoundError('Project');
  }

  const { membershipRole, ownerId } = await loadWorkspaceMembership(
    project.workspaceId,
    userId,
  );

  const workspaceAccess = buildWorkspaceAccess(userId, project.workspaceId, membershipRole, ownerId);

  // Owners and Admins bypass project membership requirements
  if (workspaceAccess.effectiveRole !== 'OWNER' && workspaceAccess.effectiveRole !== 'ADMIN') {
    await assertProjectMembership(projectId, userId);
  }

  return {
    ...workspaceAccess,
    projectId,
  };
}

export async function resolveBoardAccess(
  boardId: string,
  userId: string,
): Promise<BoardAccess> {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { id: true, projectId: true },
  });

  if (!board) {
    throw new NotFoundError('Board');
  }

  const projectAccess = await resolveProjectAccess(board.projectId, userId);

  return {
    ...projectAccess,
    boardId: board.id,
  };
}

export async function resolveTaskAccess(
  taskId: string,
  userId: string,
): Promise<TaskAccess> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      boardId: true,
      reporterId: true,
      assigneeId: true,
    },
  });

  if (!task) {
    throw new NotFoundError('Task');
  }

  const boardAccess = await resolveBoardAccess(task.boardId, userId);

  return {
    ...boardAccess,
    taskId: task.id,
    reporterId: task.reporterId,
    assigneeId: task.assigneeId,
  };
}

/** Returns project IDs the user may access within a workspace (single query set, no N+1). */
export async function resolveAccessibleProjectIds(
  workspaceId: string,
  userId: string,
): Promise<string[]> {
  const workspaceAccess = await resolveWorkspaceAccess(workspaceId, userId);

  const projects = await prisma.project.findMany({
    where: { workspaceId, deletedAt: null },
    select: { id: true },
  });

  if (projects.length === 0) {
    return [];
  }

  const projectIds = projects.map((project) => project.id);

  // Workspace Owners and Admins have access to all projects in the workspace
  if (workspaceAccess.effectiveRole === 'OWNER' || workspaceAccess.effectiveRole === 'ADMIN') {
    return projectIds;
  }

  const restrictedProjectIds = await prisma.projectMember.groupBy({
    by: ['projectId'],
    where: { projectId: { in: projectIds } },
  });

  if (restrictedProjectIds.length === 0) {
    return projectIds;
  }

  const restrictedIds = new Set(
    restrictedProjectIds.map((entry) => entry.projectId),
  );

  const userMemberships = await prisma.projectMember.findMany({
    where: {
      userId,
      projectId: { in: [...restrictedIds] },
    },
    select: { projectId: true },
  });

  const accessibleRestrictedIds = new Set(
    userMemberships.map((membership) => membership.projectId),
  );

  return projectIds.filter(
    (id) => !restrictedIds.has(id) || accessibleRestrictedIds.has(id),
  );
}

/** @deprecated Use resolveProjectAccess — kept for incremental migration. */
export async function assertProjectAccess(
  projectId: string,
  userId: string,
): Promise<{
  role: Role;
  ownerId: string;
  workspaceId: string;
  effectiveRole: EffectiveRole;
}> {
  const access = await resolveProjectAccess(projectId, userId);
  return {
    role: access.permissionRole,
    ownerId: access.ownerId,
    workspaceId: access.workspaceId,
    effectiveRole: access.effectiveRole,
  };
}
