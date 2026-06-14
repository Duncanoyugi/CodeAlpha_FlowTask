import { useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column as ColumnType } from '@/types/board.types';
import type { Task } from '@/types/task.types';
import Column from './Column';

interface KanbanBoardProps {
  columns: ColumnType[];
  tasks: Task[];
  currentUserId?: string;
  onAddTask?: (columnId: string) => void;
  onEditColumn?: (columnId: string, name: string) => Promise<void>;
  onDeleteColumn?: (columnId: string) => Promise<void>;
  onReorderColumns?: (columnIds: string[]) => Promise<void>;
  onMoveTask?: (taskId: string, sourceColumnId: string, targetColumnId: string, newPosition: number) => Promise<void>;
  onReorderTasks?: (columnId: string, taskIds: string[]) => Promise<void>;
  onTaskClick: (taskId: string) => void;
}

type TaskMap = Record<string, Task[]>;

const buildTaskMap = (tasks: Task[]): TaskMap => {
  const map: TaskMap = {};
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const colId = task.columnId;
    if (!map[colId]) map[colId] = [];
    map[colId].push(task);
  }
  return map;
};

const sortTasks = (list: Task[]): Task[] =>
  list.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

const KanbanBoard = ({
  columns,
  tasks,
  currentUserId,
  onAddTask,
  onEditColumn,
  onDeleteColumn,
  onReorderColumns,
  onMoveTask,
  onReorderTasks,
  onTaskClick,
}: KanbanBoardProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(pointerSensor, keyboardSensor);

  const taskMap = useMemo<TaskMap>(() => buildTaskMap(tasks), [tasks]);

  const getColumnTasks = useCallback(
    (columnId: string) => sortTasks(taskMap[columnId] ?? []),
    [taskMap]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback(() => {
    // Reserved for future column-task hover interpolation
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const columnId = active.id as string;
      const overId = over.id as string;

      const isColumn = columns.some((col) => col.id === columnId);
      if (isColumn) {
        const oldIndex = columns.findIndex((col) => col.id === columnId);
        const newIndex = columns.findIndex((col) => col.id === overId);

        if (oldIndex !== newIndex && newIndex !== -1) {
          if (!onReorderColumns) return;
          const newOrder = [...columns];
          const [movedItem] = newOrder.splice(oldIndex, 1);
          newOrder.splice(newIndex, 0, movedItem);
          await onReorderColumns(newOrder.map((col) => col.id));
        }
        return;
      }

      const activeTask = tasks.find((task) => task.id === columnId);
      if (!activeTask) return;

      const overColumn = columns.find((col) => col.id === overId);
      const overTask = tasks.find((task) => task.id === overId);

      const targetColumnId = overColumn
        ? overColumn.id
        : overTask
          ? overTask.columnId
          : null;

      if (!targetColumnId) return;

      const targetColumnTasks = getColumnTasks(targetColumnId);

      if (targetColumnId === activeTask.columnId) {
        const overIndex = targetColumnTasks.findIndex((t) => t.id === overId);
        const activeIndex = targetColumnTasks.findIndex((t) => t.id === columnId);

        if (activeIndex !== overIndex && overIndex !== -1 && activeIndex !== -1) {
          if (!onReorderTasks) return;
          const reordered = [...targetColumnTasks];
          const [moved] = reordered.splice(activeIndex, 1);
          reordered.splice(overIndex, 0, moved);
          await onReorderTasks(targetColumnId, reordered.map((t) => t.id));
        }
      } else {
        if (!onMoveTask) return;
        const targetPosition = targetColumnTasks.length;
        await onMoveTask(activeTask.id, activeTask.columnId, targetColumnId, targetPosition);
      }
    },
    [columns, tasks, onReorderColumns, onMoveTask, onReorderTasks, getColumnTasks]
  );

  const emptyState = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-900">No columns yet</p>
        <p className="text-xs text-gray-500 mt-1">
          Click &quot;Add Column&quot; to start organizing your work.
        </p>
      </div>
    ),
    []
  );

  const isEmptyDraggingColumn = columns.length === 0 && !activeId;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={columns.map((col) => col.id)} strategy={horizontalListSortingStrategy}>
        {columns.length === 0 && isEmptyDraggingColumn ? (
          emptyState
        ) : (
          <div className="flex gap-4 items-start overflow-x-auto pb-6 min-h-[calc(100vh-200px)]">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={getColumnTasks(column.id)}
                currentUserId={currentUserId}
                onAddTask={onAddTask}
                onEditColumn={onEditColumn}
                onDeleteColumn={onDeleteColumn}
                onTaskClick={onTaskClick}
              />
            ))}
          </div>
        )}
      </SortableContext>
    </DndContext>
  );
};

export default KanbanBoard;
