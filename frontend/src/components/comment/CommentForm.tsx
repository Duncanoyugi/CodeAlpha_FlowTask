import { useState, useRef } from 'react';
import { useAppSelector } from '@store/hooks';
import Avatar from '@components/ui/Avatar';
import Button from '@components/ui/Button';
import { useSocket } from '@/hooks/useSocket';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
}

const CommentForm = ({ onSubmit }: CommentFormProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const { socket, isConnected } = useSocket();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTyping = () => {
    if (!socket || !isConnected) return;
    
    socket.emit('typing:start', {
      taskId: '', // Will be set by parent
      userId: user?.id,
      userName: `${user?.firstName} ${user?.lastName}`,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', {
        taskId: '',
        userId: user?.id,
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-3">
        <Avatar
          name={`${user?.firstName} ${user?.lastName}`}
          src={user?.avatar}
          size="md"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleTyping();
            }}
            placeholder="Write a comment... Use @ to mention someone"
            className="input-field resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <Button type="submit" size="sm" isLoading={isSubmitting} disabled={!content.trim()}>
              Post Comment
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;