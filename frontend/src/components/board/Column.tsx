import { useCallback, useMemo, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column as ColumnType } from '@/types/board.types';
import type { Task } from '@/types/task.types';
import TaskCard from './TaskCard';
import Button from '@components/ui/Button';
import { GripVertical, Plus, Pencil, Trash2 } from 'lucide-react';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  currentUserId?: string;
  onAddTask?: (columnId: string) => void;
  onEditColumn?: (columnId: string, name: string) => Promise<void>;
  onDeleteColumn?: (columnId: string) => Promise<void>;
  onTaskClick: (taskId: string) => void;
}

const Column = ({ column, tasks, currentUserId, onAddTask, onEditColumn, onDeleteColumn, onTaskClick }: ColumnProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(column.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const canManageColumn = Boolean(onEditColumn && onDeleteColumn);
  const canAddTask = Boolean(onAddTask);
  const sortedTasks = useMemo(() => tasks.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0)), [tasks]);

  const handleEditSubmit = useCallback(async () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== column.name && onEditColumn) {
      await onEditColumn(column.id, trimmed);
    } else if (!trimmed) {
      setEditName(column.name);
    }
    setIsEditing(false);
  }, [editName, column.id, column.name, onEditColumn]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleEditSubmit();
      } else if (e.key === 'Escape') {
        setEditName(column.name);
        setIsEditing(false);
      }
    },
    [handleEditSubmit, column.name]
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-72 flex-shrink-0 flex flex-col max-h-full rounded-xl border border-gray-200 bg-gray-50/70 shadow-sm"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-gray-200 bg-white/60 backdrop-blur-sm rounded-t-xl">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>

          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={handleKeyDown}
              className="input-field py-1 px-2 text-sm font-semibold"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{column.name}</h3>
              <span className="inline-flex items-center justify-center text-[11px] font-medium text-gray-500 bg-gray-200/80 px-1.5 py-0.5 rounded-full min-w-[22px]">
                {tasks.length}
              </span>
            </div>
          )}
        </div>

          {canManageColumn && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-indigo-600 p-1 rounded-md hover:bg-indigo-50 transition-colors"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDeleteColumn?.(column.id)}
              className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
          )}
      </div>

      {/* Tasks Container */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[180px]">
        {sortedTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-xs text-gray-400">No tasks in this column</p>
            {canAddTask && (
            <button
              className="text-xs text-indigo-600 hover:text-indigo-700 mt-1 font-medium"
              onClick={() => onAddTask?.(column.id)}
            >
              Create the first task
            </button>
            )}
          </div>
        )}
        <SortableContext items={sortedTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              currentUserId={currentUserId}
              task={task}
              onClick={() => onTaskClick(task.id)}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add Task Button */}
      <div className="p-2 border-t border-gray-200 bg-gray-50/50 rounded-b-xl">
        {canAddTask && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
          onClick={() => onAddTask?.(column.id)}
        >
          <Plus size={14} className="mr-1.5" />
          Add Task
        </Button>
        )}
      </div>
    </div>
  );
};

export default Column;
