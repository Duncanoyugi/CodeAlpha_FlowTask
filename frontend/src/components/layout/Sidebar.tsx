import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Settings, 
  Users,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { cn } from '@utils/cn';
import { ROUTES } from '@constants/routes';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();

  const navItems = [
    { path: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { path: ROUTES.WORKSPACES, icon: Home, label: 'Workspaces' },
    { path: ROUTES.PROJECTS, icon: FolderKanban, label: 'Projects' },
    { path: ROUTES.SETTINGS, icon: Settings, label: 'Settings' },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          {isOpen && (
            <Link to={ROUTES.DASHBOARD} className="text-xl font-bold text-primary-600">
              TaskFlow
            </Link>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100',
                  isActive && 'bg-primary-50 text-primary-600',
                  !isOpen && 'justify-center'
                )}
              >
                <item.icon size={20} />
                {isOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className={cn('flex items-center gap-3', !isOpen && 'justify-center')}>
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <Users size={16} className="text-primary-600" />
            </div>
            {isOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Team Workspace</p>
                <p className="text-xs text-gray-500">v1.0.0</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;