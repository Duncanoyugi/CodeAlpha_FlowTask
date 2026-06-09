export interface CreateCommentDto {
  content: string;
}

export interface UpdateCommentDto {
  content: string;
}

export interface CommentResponseDto {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  editedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
  };
  mentions?: Array<{
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}