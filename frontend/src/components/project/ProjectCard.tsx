import { useNavigate } from 'react-router-dom';
import type { Project } from '@/types/project.types';
import { ROUTES } from '@constants/routes';
import { Calendar, FolderKanban, Trash2 } from 'lucide-react';
import { formatDate } from '@utils/formatDate';

interface ProjectCardProps {
  project: Project;
  workspaceId?: string;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}

const ProjectCard = ({ project, workspaceId, onDelete, canDelete = true }: ProjectCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const route = workspaceId
      ? ROUTES.WORKSPACE_PROJECT_DETAIL.replace(':workspaceId', workspaceId).replace(':projectId', project.id)
      : ROUTES.PROJECT_DETAIL.replace(':projectId', project.id);
    navigate(route);
  };

  return (
    <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: project.color || '#3b82f6' }}
          >
            <span className="text-white font-semibold text-lg">
              {project.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-500">Created {formatDate(project.createdAt)}</p>
          </div>
        </div>
        {canDelete && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project.id);
          }}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 size={18} />
        </button>
        )}
      </div>
      
      {project.description && (
        <div className="card-body">
          <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
        </div>
      )}
      
      <div className="card-footer flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <FolderKanban size={14} />
            <span>{project._count?.boards || 0} Boards</span>
          </div>
          {project.endDate && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>Due {formatDate(project.endDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;