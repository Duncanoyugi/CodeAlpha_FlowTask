import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { fetchTaskById, updateTask, deleteTask } from '@store/slices/taskSlice';
import { fetchComments, createComment, updateComment, deleteComment } from '@store/slices/commentSlice';
import { fetchTaskActivities } from '@store/slices/activitySlice';
import { showToast, closeModal } from '@store/slices/uiSlice';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Avatar from '@components/ui/Avatar';
import Spinner from '@components/ui/Spinner';
import CommentList from '@components/comment/CommentList';
import CommentForm from '@components/comment/CommentForm';
import ActivityLog from '@components/activity/ActivityLog';
import { PriorityLabels, PRIORITIES } from '@/constants/priorities';
import { Calendar, Edit2, Trash2, MessageCircle, History } from 'lucide-react';
import { formatDateTime } from '@utils/formatDate';
import { RolePermissions } from '@/constants/roles';
import { useSocket } from '@/hooks/useSocket';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
}

type TabType = 'comments' | 'activity';

const TaskDetailModal = ({ isOpen, onClose, taskId }: TaskDetailModalProps) => {
  const dispatch = useAppDispatch();
  const { currentTask, isLoading } = useAppSelector((state) => state.task);
  const { comments } = useAppSelector((state) => state.comment);
  const { activities } = useAppSelector((state) => state.activity);
  const { user } = useAppSelector((state) => state.auth);
  const { currentRole, currentWorkspace } = useAppSelector((state) => state.workspace);
  const { socket, isConnected } = useSocket();

  const workspaceId = currentWorkspace?.id ?? null;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    priority: '',
    assigneeId: '',
    dueDate: '',
  });
  const [activeTab, setActiveTab] = useState<TabType>('comments');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && taskId) {
      dispatch(fetchTaskById(taskId));
      dispatch(fetchComments(taskId));
      
      if (workspaceId) {
        dispatch(fetchTaskActivities({ workspaceId, taskId }));
      }
      
      // Join task room for real-time updates
      if (socket && isConnected) {
        socket.emit('join:task', taskId);
      }
    }
    
    return () => {
      if (socket && isConnected && taskId) {
        socket.emit('leave:task', taskId);
      }
    };
  }, [isOpen, taskId, dispatch, socket, isConnected, workspaceId]);

  useEffect(() => {
    if (currentTask) {
      setEditData({
        title: currentTask.title,
        description: currentTask.description || '',
        priority: currentTask.priority,
        assigneeId: currentTask.assigneeId || '',
        dueDate: currentTask.dueDate ? currentTask.dueDate.split('T')[0] : '',
      });
    }
  }, [currentTask]);

  // Real-time comment updates via WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleCommentAdded = (comment: any) => {
      if (comment.taskId === taskId) {
        dispatch(fetchComments(taskId));
      }
    };

    const handleCommentUpdated = (comment: any) => {
      if (comment.taskId === taskId) {
        dispatch(fetchComments(taskId));
      }
    };

    const handleCommentDeleted = (data: any) => {
      if (data.taskId === taskId) {
        dispatch(fetchComments(taskId));
      }
    };

    socket.on('comment:added', handleCommentAdded);
    socket.on('comment:updated', handleCommentUpdated);
    socket.on('comment:deleted', handleCommentDeleted);

    return () => {
      socket.off('comment:added', handleCommentAdded);
      socket.off('comment:updated', handleCommentUpdated);
      socket.off('comment:deleted', handleCommentDeleted);
    };
  }, [socket, isConnected, taskId, dispatch]);

  const handleUpdateTask = async () => {
    try {
      await dispatch(updateTask({
        taskId,
        data: {
          title: editData.title,
          description: editData.description || undefined,
          priority: editData.priority as any,
          assigneeId: editData.assigneeId || null,
          dueDate: editData.dueDate || null,
        }
      })).unwrap();
      dispatch(showToast({ message: 'Task updated successfully!', type: 'success' }));
      setIsEditing(false);
    } catch (error: any) {
      dispatch(showToast({ message: error || 'Failed to update task', type: 'error' }));
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      dispatch(showToast({ message: 'Task deleted successfully!', type: 'success' }));
      dispatch(closeModal());
    } catch (error: any) {
      dispatch(showToast({ message: error || 'Failed to delete task', type: 'error' }));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddComment = async (content: string) => {
    try {
      await dispatch(createComment({ taskId, data: { content } })).unwrap();
      dispatch(showToast({ message: 'Comment added!', type: 'success' }));
    } catch (error: any) {
      dispatch(showToast({ message: error || 'Failed to add comment', type: 'error' }));
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      await dispatch(updateComment({ commentId, data: { content } })).unwrap();
      dispatch(showToast({ message: 'Comment updated!', type: 'success' }));
    } catch (error: any) {
      dispatch(showToast({ message: error || 'Failed to update comment', type: 'error' }));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await dispatch(deleteComment(commentId)).unwrap();
      dispatch(showToast({ message: 'Comment deleted!', type: 'success' }));
    } catch (error: any) {
      dispatch(showToast({ message: error || 'Failed to delete comment', type: 'error' }));
    }
  };

  if (isLoading || !currentTask) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Task Details" size="xl">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </Modal>
    );
  }

  const permissions = currentRole ? RolePermissions[currentRole] : undefined;
  const isTaskOwnerOrAssignee = user?.id === currentTask.reporterId || user?.id === currentTask.assigneeId;
  const canEditTask = Boolean(permissions?.canManageAllTasks || isTaskOwnerOrAssignee);
  const canDeleteTask = Boolean(permissions?.canManageAllTasks || user?.id === currentTask.reporterId);
  const canEditOwnComment = permissions?.canEditOwnComment ?? false;
  const canDeleteOwnComment = permissions?.canDeleteOwnComment ?? false;
  const canViewActivity = permissions?.canViewActivityLogs ?? false;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="text-xl font-semibold input-field mb-2"
              autoFocus
            />
          ) : (
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{currentTask.title}</h2>
          )}
          <div className="flex items-center gap-3">
            <Badge variant={
              currentTask.priority === 'URGENT' ? 'danger' :
              currentTask.priority === 'HIGH' ? 'warning' :
              currentTask.priority === 'MEDIUM' ? 'info' : 'default'
            }>
              {PriorityLabels[currentTask.priority]}
            </Badge>
            {currentTask.dueDate && (
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar size={14} />
                Due {formatDateTime(currentTask.dueDate)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEditTask && !isEditing && (
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 size={14} className="mr-1" />
              Edit
            </Button>
          )}
          {canEditTask && isEditing && (
            <>
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleUpdateTask}>
                Save
              </Button>
            </>
          )}
          {canDeleteTask && (
          <Button variant="danger" size="sm" onClick={handleDeleteTask} isLoading={isDeleting}>
            <Trash2 size={14} className="mr-1" />
            Delete
          </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="input-field"
                rows={4}
                placeholder="Add a description..."
              />
            ) : (
              <div className="text-gray-600 whitespace-pre-wrap">
                {currentTask.description || 'No description provided.'}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'comments'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageCircle size={16} />
                Comments ({comments.length})
              </button>
              {canViewActivity && (
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'activity'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <History size={16} />
                Activity ({activities.length})
              </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'comments' || !canViewActivity ? (
              <div>
                <CommentForm onSubmit={handleAddComment} />
                <CommentList
                  comments={comments}
                  onEdit={handleUpdateComment}
                  onDelete={handleDeleteComment}
                  currentUserId={user?.id}
                  canEditOwnComment={canEditOwnComment}
                  canDeleteOwnComment={canDeleteOwnComment}
                />
              </div>
            ) : (
              <ActivityLog activities={activities} />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-1">
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            {/* Assignee */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.assigneeId}
                  onChange={(e) => setEditData({ ...editData, assigneeId: e.target.value })}
                  placeholder="Assignee ID"
                  className="input-field text-sm mt-1"
                />
              ) : (
                <div className="mt-2">
                  {currentTask.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={`${currentTask.assignee.firstName} ${currentTask.assignee.lastName}`}
                        src={currentTask.assignee.avatar}
                        size="sm"
                      />
                      <span className="text-sm text-gray-700">
                        {currentTask.assignee.firstName} {currentTask.assignee.lastName}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">Unassigned</p>
                  )}
                </div>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</label>
              {isEditing ? (
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                  className="input-field text-sm mt-1"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{PriorityLabels[p]}</option>
                  ))}
                </select>
              ) : (
                <div className="mt-2">
                  <Badge variant={
                    currentTask.priority === 'URGENT' ? 'danger' :
                    currentTask.priority === 'HIGH' ? 'warning' :
                    currentTask.priority === 'MEDIUM' ? 'info' : 'default'
                  }>
                    {PriorityLabels[currentTask.priority]}
                  </Badge>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editData.dueDate}
                  onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                  className="input-field text-sm mt-1"
                />
              ) : (
                <p className="text-sm text-gray-700 mt-1">
                  {currentTask.dueDate ? formatDateTime(currentTask.dueDate) : 'No due date'}
                </p>
              )}
            </div>

            {/* Reporter */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</label>
              <div className="mt-2 flex items-center gap-2">
                <Avatar
                  name={`${currentTask.reporter?.firstName || ''} ${currentTask.reporter?.lastName || ''}`}
                  src={currentTask.reporter?.avatar}
                  size="sm"
                />
                <span className="text-sm text-gray-700">
                  {currentTask.reporter?.firstName} {currentTask.reporter?.lastName}
                </span>
              </div>
            </div>

            {/* Created At */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created</label>
              <p className="text-sm text-gray-700 mt-1">{formatDateTime(currentTask.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;