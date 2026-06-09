import { prisma } from '../../../src/lib/prisma';
import { Column } from '../../generated/prisma';

export class ColumnRepository {
  async create(data: {
    boardId: string;
    name: string;
    position: number;
  }): Promise<Column> {
    return prisma.column.create({
      data,
    });
  }

  async findById(id: string): Promise<Column | null> {
    return prisma.column.findUnique({
      where: { id },
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
    });
  }

  async findAllByBoard(boardId: string): Promise<Column[]> {
    return prisma.column.findMany({
      where: { boardId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { position: 'asc' },
    });
  }

  async update(id: string, data: Partial<Column>): Promise<Column> {
    return prisma.column.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.column.delete({
      where: { id },
    });
  }

  async getMaxPosition(boardId: string): Promise<number> {
    const maxPosition = await prisma.column.aggregate({
      where: { boardId },
      _max: { position: true },
    });
    return (maxPosition._max.position || 0) + 100;
  }

  async reorderColumns(columnIds: string[]): Promise<void> {
    // Update each column's position based on array index
    for (let i = 0; i < columnIds.length; i++) {
      await prisma.column.update({
        where: { id: columnIds[i] },
        data: { position: (i + 1) * 100 },
      });
    }
  }

  async getBoardId(columnId: string): Promise<string | null> {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      select: { boardId: true },
    });
    return column?.boardId || null;
  }
}