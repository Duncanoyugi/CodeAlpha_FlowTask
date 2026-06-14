import type { Comment } from '@/types/comment.types';
import CommentItem from './CommentItem';

interface CommentListProps {
  comments: Comment[];
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  currentUserId?: string;
  canEditOwnComment?: boolean;
  canDeleteOwnComment?: boolean;
}

const CommentList = ({ comments, onEdit, onDelete, currentUserId, canEditOwnComment = true, canDeleteOwnComment = true }: CommentListProps) => {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={canEditOwnComment && currentUserId === comment.authorId}
          canDelete={canDeleteOwnComment && currentUserId === comment.authorId}
        />
      ))}
    </div>
  );
};

export default CommentList;