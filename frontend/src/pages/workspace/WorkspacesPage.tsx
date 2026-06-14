import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { fetchWorkspaces, createWorkspace, deleteWorkspace } from '@store/slices/workspaceSlice';
import { showToast } from '@store/slices/uiSlice';
import WorkspaceCard from '@components/workspace/WorkspaceCard';
import CreateWorkspaceModal from '@components/workspace/CreateWorkspaceModal';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';
import { Plus } from 'lucide-react';

const WorkspacesPage = () => {
  const dispatch = useAppDispatch();
  const { workspaces, isLoading } = useAppSelector((state) => state.workspace);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  const handleCreateWorkspace = async (data: { name: string; description?: string }) => {
    try {
      await dispatch(createWorkspace(data)).unwrap();
      dispatch(showToast({ message: 'Workspace created successfully!', type: 'success' }));
      setIsCreateModalOpen(false);
    } catch (error: any) {
      dispatch(showToast({ message: error || 'Failed to create workspace', type: 'error' }));
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (window.confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      try {
        await dispatch(deleteWorkspace(workspaceId)).unwrap();
        dispatch(showToast({ message: 'Workspace deleted successfully!', type: 'success' }));
      } catch (error: any) {
        dispatch(showToast({ message: error || 'Failed to delete workspace', type: 'error' }));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workspaces</h1>
          <p className="text-gray-600 mt-1">Manage your team workspaces and collaborate on projects</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Workspace
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No workspaces yet</h3>
          <p className="text-gray-500 mt-1">Create your first workspace to get started</p>
          <Button className="mt-4" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              onDelete={handleDeleteWorkspace}
            />
          ))}
        </div>
      )}

      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateWorkspace}
      />
    </div>
  );
};

export default WorkspacesPage;