import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { fetchBoardById, fetchColumns, createColumn, updateColumn, deleteColumn, reorderColumns } from '@store/slices/boardSlice';
import { fetchTasks, createTask, moveTask, reorderTasks } from '@store/slices/taskSlice';
import { fetchWorkspaceMembers } from '@store/slices/workspaceSlice';
import type { CreateTaskData } from '@/types/task.types';
import { showToast, openModal } from '@store/slices/uiSlice';
import KanbanBoard from '@components/board/KanbanBoard';
import CreateColumnModal from '@/components/column/CreateColumnModal';
import CreateTaskModal from '@/components/task/CreateTaskModal';
import TaskDetailModal from '@components/task/TaskDetailModal';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';
import { Plus, ArrowLeft } from 'lucide-react';
import { RolePermissions } from '@constants/roles';

const BoardPage = () => {
  const { boardId } = useParams<{ boardId?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentBoard, columns, isLoading: boardLoading } = useAppSelector((state) => state.board);
  const { tasks } = useAppSelector((state) => state.task);
  const { activeModal, modalData } = useAppSelector((state) => state.ui);
  const { currentRole } = useAppSelector((state) => state.workspace);
  const { user } = useAppSelector((state) => state.auth);
  
  const [isCreateColumnModalOpen, setIsCreateColumnModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoardById(boardId));
      dispatch(fetchColumns(boardId));
      dispatch(fetchTasks(boardId));
    }
  }, [dispatch, boardId]);

  useEffect(() => {
    if (currentBoard?.workspaceId) {
      dispatch(fetchWorkspaceMembers(currentBoard.workspaceId));
    }
  }, [currentBoard?.workspaceId, dispatch]);

  const handleCreateColumn = async (data: { name: string }) => {
    if (!boardId) return;
    try {
      await dispatch(createColumn({ boardId, data })).unwrap();
      dispatch(showToast({ message: 'Column created successfully!', type: 'success' }));
      setIsCreateColumnModalOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create column';
      dispatch(showToast({ message, type: 'error' }));
    }
  };

  const handleUpdateColumn = async (columnId: string, name: string) => {
    if (!boardId) return;
    try {
      await dispatch(updateColumn({ boardId, columnId, data: { name } })).unwrap();
      dispatch(showToast({ message: 'Column updated successfully!', type: 'success' }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update column';
      dispatch(showToast({ message, type: 'error' }));
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!boardId) return;
    if (window.confirm('Are you sure you want to delete this column? All tasks in it will be moved to the first column.')) {
      try {
        await dispatch(deleteColumn({ boardId, columnId })).unwrap();
        dispatch(showToast({ message: 'Column deleted successfully!', type: 'success' }));
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to delete column';
        dispatch(showToast({ message, type: 'error' }));
      }
    }
  };

  const handleReorderColumns = async (columnIds: string[]) => {
    if (!boardId) return;
    try {
      await dispatch(reorderColumns({ boardId, columnIds })).unwrap();
    } catch {
      console.error('Failed to reorder columns');
    }
  };

  const handleCreateTask = async (data: CreateTaskData) => {
    if (!boardId || !selectedColumnId) return;
    try {
      await dispatch(createTask({ 
        boardId, 
        columnId: selectedColumnId, 
        data 
      })).unwrap();
      dispatch(showToast({ message: 'Task created successfully!', type: 'success' }));
      setIsCreateTaskModalOpen(false);
      setSelectedColumnId(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create task';
      dispatch(showToast({ message, type: 'error' }));
    }
  };

  const handleMoveTask = async (taskId: string, _sourceColumnId: string, targetColumnId: string, newPosition: number) => {
    try {
      await dispatch(moveTask({ 
        taskId, 
        data: { columnId: targetColumnId, position: newPosition } 
      })).unwrap();
    } catch (error: unknown) {
      console.error('Failed to move task:', error);
    }
  };

  const handleReorderTasks = async (columnId: string, taskIds: string[]) => {
    try {
      await dispatch(reorderTasks({ columnId, taskIds })).unwrap();
    } catch (error: unknown) {
      console.error('Failed to reorder tasks:', error);
    }
  };

  const openTaskDetail = (taskId: string) => {
    dispatch(openModal({ modalId: 'taskDetail', data: { taskId } }));
  };

  const workspacePermissions = currentBoard && currentRole
    ? RolePermissions[currentRole]
    : undefined;
  const canManageBoard = workspacePermissions?.canCreateBoard ?? false;
  const canCreateTask = workspacePermissions?.canCreateTask ?? false;
  const canMoveTask = workspacePermissions?.canManageAllTasks ?? false;
  const canReorderTasks = workspacePermissions?.canManageAllTasks ?? false;

  if (boardLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Board not found</p>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{currentBoard.name}</h1>
          <p className="text-gray-600 mt-1">{currentBoard.description || 'No description'}</p>
        </div>
        {canManageBoard && (
        <Button onClick={() => setIsCreateColumnModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Column
        </Button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-6">
        <KanbanBoard
          columns={columns}
          tasks={tasks}
          onAddTask={canCreateTask ? (columnId) => {
            setSelectedColumnId(columnId);
            setIsCreateTaskModalOpen(true);
          } : undefined}
          onEditColumn={canManageBoard ? handleUpdateColumn : undefined}
          onDeleteColumn={canManageBoard ? handleDeleteColumn : undefined}
          onReorderColumns={canManageBoard ? handleReorderColumns : undefined}
          onMoveTask={canMoveTask ? handleMoveTask : undefined}
          onReorderTasks={canReorderTasks ? handleReorderTasks : undefined}
          onTaskClick={openTaskDetail}
          currentUserId={user?.id}
        />
      </div>

      {/* Modals */}
      {canManageBoard && (
      <CreateColumnModal
        isOpen={isCreateColumnModalOpen}
        onClose={() => setIsCreateColumnModalOpen(false)}
        onSubmit={handleCreateColumn}
      />
      )}

      {canCreateTask && (
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => {
          setIsCreateTaskModalOpen(false);
          setSelectedColumnId(null);
        }}
        onSubmit={handleCreateTask}
      />
      )}

      <TaskDetailModal
        isOpen={activeModal === 'taskDetail'}
        onClose={() => dispatch(openModal({ modalId: '' }))}
        taskId={modalData.taskDetail?.taskId}
      />
    </div>
  );
};

export default BoardPage;