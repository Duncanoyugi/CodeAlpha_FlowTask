import { useState } from 'react';
import type { Comment } from '@/types/comment.types';
import Avatar from '@components/ui/Avatar';
import Button from '@components/ui/Button';
import { formatSmartDate } from '@utils/formatDate';
import { Edit2, Trash2, Check, X } from 'lucide-react';

interface CommentItemProps {
  comment: Comment;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  canEdit: boolean;
  canDelete: boolean;
}

const CommentItem = ({ comment, onEdit, onDelete, canEdit, canDelete }: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!editContent.trim()) return;
    setIsSubmitting(true);
    try {
      await onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await onDelete(comment.id);
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar
        name={`${comment.author.firstName} ${comment.author.lastName}`}
        src={comment.author.avatar}
        size="md"
      />
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="font-medium text-sm text-gray-900">
                {comment.author.firstName} {comment.author.lastName}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {formatSmartDate(comment.createdAt)}
              </span>
              {comment.editedAt && (
                <span className="text-xs text-gray-400 ml-2">(edited)</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {canEdit && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <Edit2 size={14} />
                </button>
              )}
              {canDelete && !isEditing && (
                <button
                  onClick={handleDelete}
                  className="text-gray-400 hover:text-red-600 p-1"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
          
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="input-field text-sm"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={handleSave} isLoading={isSubmitting}>
                  <Check size={14} className="mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="secondary" onClick={handleCancel}>
                  <X size={14} className="mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">
              {comment.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;