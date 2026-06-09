import { prisma } from '../../../src/lib/prisma';
import { Board } from '../../generated/prisma';

export class BoardRepository {
  async create(data: {
    projectId: string;
    name: string;
  }): Promise<Board> {
    return prisma.board.create({
      data,
    });
  }

  async findById(id: string): Promise<Board | null> {
    return prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
              include: {
                assignee: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    avatar: true,
                  },
                },
                reporter: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    avatar: true,
                  },
                },
                labels: {
                  include: {
                    label: true,
                  },
                },
                _count: {
                  select: {
                    comments: true,
                    attachments: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAllByProject(projectId: string): Promise<Board[]> {
    return prisma.board.findMany({
      where: { projectId, deletedAt: null },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            _count: {
              select: { tasks: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: string, data: Partial<Board>): Promise<Board> {
    return prisma.board.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.board.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await prisma.board.delete({
      where: { id },
    });
  }

  async getProjectId(boardId: string): Promise<string | null> {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: { projectId: true },
    });
    return board?.projectId || null;
  }
}