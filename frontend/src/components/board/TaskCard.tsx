import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types/task.types';
import { PriorityColors } from '@/constants/priorities';
import type { Priority } from '@/constants/priorities';
import Avatar from '@components/ui/Avatar';
import { Calendar, MessageCircle, Paperclip, GripVertical } from 'lucide-react';
import { formatSmartDate, isOverdue } from '@utils/formatDate';
import { cn } from '@utils/cn';

interface TaskCardProps {
  task: Task;
  currentUserId?: string;
  onClick: () => void;
}

const TaskCard = ({ task, currentUserId, onClick }: TaskCardProps) => {
  const canMoveTask = Boolean(currentUserId && (task.reporterId === currentUserId || task.assigneeId === currentUserId));
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !canMoveTask });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityLabel = task.priority;
  const showFullDate = isOverdue(task.dueDate);

  const handleDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        'group bg-white rounded-lg border border-gray-200 shadow-sm p-3 cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-indigo-200',
        'focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <button
              className={cn(
                'cursor-grab active:cursor-grabbing transition-colors',
                canMoveTask ? 'text-gray-300 hover:text-gray-500' : 'text-transparent cursor-default'
              )}
              {...attributes}
              {...(canMoveTask ? listeners : {})}
              onClick={handleDrag}
            >
              <GripVertical size={14} />
            </button>
            <span
              className={cn(
                'text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full',
                PriorityColors[task.priority as Priority] ?? 'bg-gray-100 text-gray-800'
              )}
            >
              {priorityLabel}
            </span>
          </div>
          <h4 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2 mb-2">
            {task.title}
          </h4>
        </div>
      </div>

      {/* Task Metadata */}
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
        {task.dueDate && (
          <div
            className={cn(
              'flex items-center gap-1',
              showFullDate && 'text-red-600 font-medium'
            )}
          >
            <Calendar size={12} className={cn(showFullDate && 'text-red-500')} />
            <span>{formatSmartDate(task.dueDate)}</span>
          </div>
        )}
        {typeof task._count?.comments === 'number' && task._count.comments > 0 && (
          <div className="flex items-center gap-1 text-gray-500">
            <MessageCircle size={12} />
            <span>{task._count.comments}</span>
          </div>
        )}
        {typeof task._count?.attachments === 'number' && task._count.attachments > 0 && (
          <div className="flex items-center gap-1 text-gray-500">
            <Paperclip size={12} />
            <span>{task._count.attachments}</span>
          </div>
        )}
      </div>

      {/* Assignee */}
      {task.assignee && (
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Avatar
              name={`${task.assignee.firstName} ${task.assignee.lastName}`}
              src={task.assignee.avatar}
              size="sm"
            />
            <span className="text-xs text-gray-600 font-medium truncate">
              {task.assignee.firstName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
