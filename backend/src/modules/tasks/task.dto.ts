import { Priority } from '../../generated/prisma';

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date;
  assigneeId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date;
  assigneeId?: string;
}

export interface MoveTaskDto {
  columnId: string;
  position: number;
}

export interface TaskResponseDto {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string | null;
  position: number;
  priority: Priority;
  dueDate: Date | null;
  reporterId: string;
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  reporter?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
  };
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
  };
  labels?: Array<{
    label: {
      id: string;
      name: string;
      color: string;
    };
  }>;
  _count?: {
    comments: number;
    attachments: number;
  };
}