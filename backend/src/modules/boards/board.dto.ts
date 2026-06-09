export interface CreateBoardDto {
  name: string;
}

export interface UpdateBoardDto {
  name?: string;
}

export interface BoardResponseDto {
  id: string;
  projectId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  columns?: ColumnResponseDto[];
}

export interface ColumnResponseDto {
  id: string;
  boardId: string;
  name: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  tasks?: TaskResponseDto[];
}

export interface TaskResponseDto {
  id: string;
  title: string;
  priority: string;
  assignee?: any;
}