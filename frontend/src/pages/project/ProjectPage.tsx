import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { fetchProjects, createProject, deleteProject } from '@store/slices/projectSlice';
import { fetchWorkspaces, fetchWorkspaceMembers } from '@store/slices/workspaceSlice';
import { showToast } from '@store/slices/uiSlice';
import ProjectCard from '@components/project/ProjectCard';
import CreateProjectModal from '@components/project/CreateProjectModal';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';
import { Plus } from 'lucide-react';
import { getWorkspaceRolePermissions, isWorkspaceOwner, Role } from '@constants/roles';

const ProjectPage = () => {
  const { workspaceId } = useParams<{ workspaceId?: string }>();
  const dispatch = useAppDispatch();
  const { projects, isLoading } = useAppSelector((state) => state.project);
  const { workspaces, currentRole } = useAppSelector((state) => state.workspace);
  const { user } = useAppSelector((state) => state.auth);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  useEffect(() => {
    if (workspaceId) {
      setSelectedWorkspaceId(workspaceId);
    } else if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaceId, workspaces, selectedWorkspaceId]);

  useEffect(() => {
    const activeWorkspaceId = workspaceId || selectedWorkspaceId;
    if (activeWorkspaceId) {
      dispatch(fetchProjects(activeWorkspaceId));
      dispatch(fetchWorkspaceMembers(activeWorkspaceId));
    }
  }, [workspaceId, selectedWorkspaceId, dispatch]);

  const handleWorkspaceChange = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    dispatch(fetchProjects(workspaceId));
  };

  const handleCreateProject = async (data: { name: string; description?: string; color?: string }) => {
    try {
      await dispatch(createProject({ workspaceId: selectedWorkspaceId, data })).unwrap();
      dispatch(showToast({ message: 'Project created successfully!', type: 'success' }));
      setIsCreateModalOpen(false);
    } catch (error: any) {
      dispatch(showToast({ message: error || 'Failed to create project', type: 'error' }));
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await dispatch(deleteProject(projectId)).unwrap();
        dispatch(showToast({ message: 'Project deleted successfully!', type: 'success' }));
      } catch (error: any) {
        dispatch(showToast({ message: error || 'Failed to delete project', type: 'error' }));
      }
    }
  };

  const activeWorkspaceId = workspaceId || selectedWorkspaceId;
  const selectedWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId);
  const workspacePermissions = selectedWorkspace && user
    ? getWorkspaceRolePermissions(currentRole ?? Role.ADMIN, isWorkspaceOwner(selectedWorkspace.ownerId, user.id))
    : undefined;
  const canCreateProject = workspacePermissions?.canCreateProject ?? false;
  const canDeleteProject = workspacePermissions?.canDeleteProject ?? false;

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
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your projects and track progress</p>
        </div>
        {canCreateProject && (
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
        )}
      </div>

      {workspaces.length > 0 && (
        <div className="mb-6">
          <label className="input-label">Select Workspace</label>
          <select
            className="input-field max-w-xs"
            value={selectedWorkspaceId}
            onChange={(e) => handleWorkspaceChange(e.target.value)}
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
          <p className="text-gray-500 mt-1">Create your first project to get started</p>
          {canCreateProject && (
          <Button className="mt-4" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={canDeleteProject ? handleDeleteProject : undefined}
              canDelete={canDeleteProject}
              workspaceId={activeWorkspaceId}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export default ProjectPage;