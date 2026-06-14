export interface Board {
  id: string;
  name: string;
  description?: string | null;
  projectId: string;
  workspaceId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  columns?: Column[];
}

export interface Column {
  id: string;
  name: string;
  boardId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}
