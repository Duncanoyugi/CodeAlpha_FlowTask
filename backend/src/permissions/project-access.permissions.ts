import { prisma } from '../lib/prisma';
import { ForbiddenError, NotFoundError } from '../utils/error';
import { Role } from '../generated/prisma';

export interface ProjectAccessContext {
  role: Role;
  ownerId: string;
  workspaceId: string;
}

export async function assertProjectAccess(projectId: string, userId: string): Promise<ProjectAccessContext> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true },
  });

  if (!project) {
    throw new NotFoundError('Project');
  }

  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: project.workspaceId,
        userId,
      },
    },
  });

  if (!workspaceMember) {
    throw new ForbiddenError('You do not have access to this workspace');
  }

  const projectMembers = await prisma.projectMember.findMany({
    where: { projectId },
    select: { userId: true },
  });

  if (projectMembers.length > 0 && !projectMembers.some((member) => member.userId === userId)) {
    throw new ForbiddenError('You do not have access to this project');
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: project.workspaceId },
    select: { ownerId: true },
  });

  if (!workspace) {
    throw new NotFoundError('Workspace');
  }

  return {
    role: workspaceMember.role,
    ownerId: workspace.ownerId,
    workspaceId: project.workspaceId,
  };
}
