import { useNavigate } from 'react-router-dom';
import type { Workspace } from '@/types/workspace.types';
import { ROUTES } from '@constants/routes';
import Button from '@components/ui/Button';
import { Settings, Users, FolderKanban, Trash2 } from 'lucide-react';

interface WorkspaceCardProps {
  workspace: Workspace;
  onDelete: (id: string) => void;
}

const WorkspaceCard = ({ workspace, onDelete }: WorkspaceCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(ROUTES.WORKSPACE_PROJECTS.replace(':workspaceId', workspace.id));
  };

  return (
    <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          {workspace.logo ? (
            <img src={workspace.logo} alt={workspace.name} className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-semibold text-lg">
                {workspace.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{workspace.name}</h3>
            <p className="text-sm text-gray-500">{workspace.slug}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(workspace.id);
          }}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      {workspace.description && (
        <div className="card-body">
          <p className="text-gray-600 text-sm line-clamp-2">{workspace.description}</p>
        </div>
      )}
      
      <div className="card-footer flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>Team</span>
          </div>
          <div className="flex items-center gap-1">
            <FolderKanban size={14} />
            <span>Projects</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            // Navigate to settings
          }}
        >
          <Settings size={14} className="mr-1" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default WorkspaceCard;