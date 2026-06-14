import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  Menu,
  X,
  LayoutDashboard,
  FolderKanban,
  Home,
  Settings,
  Users,
  Search,
  User,
  LogOut,
  ChevronDown,
  Grid3x3,
  BarChart3,
  HelpCircle,
  Sun,
  Moon,
  type LucideProps,
} from 'lucide-react';
import { ROUTES } from '@constants/routes';
import { logout } from '@store/slices/authSlice';
import { showToast, toggleSidebar, setDarkMode } from '@store/slices/uiSlice';
import { cn } from '@utils/cn';
import { Role } from '@constants/roles';

// Navigation items based on user role
const getNavigationItems = (userRole: string) => {
  const baseItems = [
    { path: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { path: ROUTES.WORKSPACES, icon: Home, label: 'Workspaces' },
    { path: ROUTES.PROJECTS, icon: FolderKanban, label: 'Projects' },
  ];

  const adminItems = [
    { path: '/workspaces/members', icon: Users, label: 'Team Members' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const memberItems = [
    { path: '/my-tasks', icon: Grid3x3, label: 'My Tasks' },
  ];

  const settingsItem = [
    { path: ROUTES.SETTINGS, icon: Settings, label: 'Settings' },
  ];

  let items: Array<{ path: string; icon: React.FC<LucideProps>; label: string }> = [...baseItems];

  if (userRole === Role.ADMIN) {
    items = [...items, ...adminItems] as typeof items;
  }

  if (userRole === Role.MEMBER) {
    items = [...items, ...memberItems] as typeof items;
  }

  return [...items, ...settingsItem] as typeof items;
};

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentWorkspace, members } = useAppSelector((state) => state.workspace);
  const { isSidebarOpen, isDarkMode } = useAppSelector((state) => state.ui);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('MEMBER');

  // Get user role from workspace
  useEffect(() => {
    if (members.length) {
      const member = members.find((m) => m.userId === user?.id);
      if (member) {
        setUserRole(member.role);
      }
    }
  }, [members, user]);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navigationItems = getNavigationItems(userRole);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      dispatch(showToast({ message: 'Logged out successfully', type: 'success' }));
      navigate(ROUTES.LOGIN);
    } catch (error) {
      dispatch(showToast({ message: 'Logout failed', type: 'error' }));
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      dispatch(setDarkMode(systemPrefersDark));
    } else {
      dispatch(setDarkMode(theme === 'dark'));
    }
  };

  const getCurrentTheme = () => {
    if (isDarkMode) return 'dark';
    return 'light';
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const item = navigationItems.find(i => path.includes(i.path));
    return item?.label || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
          isSidebarOpen ? 'w-64' : 'w-20',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                TaskFlow
              </span>
            </div>
          ) : (
            <div className="mx-auto h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
          )}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hidden lg:block"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Workspace Info */}
        {currentWorkspace && isSidebarOpen && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-semibold text-lg">
                  {currentWorkspace.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {currentWorkspace.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {userRole.charAt(0) + userRole.slice(1).toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (location.pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700',
                  isActive && 'bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400',
                  !isSidebarOpen && 'justify-center'
                )}
              >
                <item.icon size={20} />
                {isSidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
          {/* Help Button */}
          <button
            className={cn(
              'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
              !isSidebarOpen && 'justify-center'
            )}
          >
            <HelpCircle size={20} />
            {isSidebarOpen && <span>Help & Support</span>}
          </button>

          {/* Version */}
          {isSidebarOpen && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-2">
              Version 1.0.0
            </p>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-300',
        isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
              >
                <Menu size={20} />
              </button>

              {/* Page Title */}
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Button */}
              <button
                onClick={() => navigate('/search')}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Search size={20} />
              </button>

              {/* Theme Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    const current = getCurrentTheme();
                    if (current === 'light') handleThemeChange('dark');
                    else if (current === 'dark') handleThemeChange('light');
                    else handleThemeChange('dark');
                  }}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <User size={16} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <ChevronDown size={16} className="text-gray-500 hidden sm:block" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                          Role: {userRole}
                        </p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setIsUserMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <User size={16} />
                          Profile Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;