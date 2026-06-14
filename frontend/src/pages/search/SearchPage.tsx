import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { globalSearch, searchTasks } from '@store/slices/searchSlice';
import { showToast } from '@store/slices/uiSlice';
import { Search, Filter, X } from 'lucide-react';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';
import TaskCard from '@components/board/TaskCard';
import type { Task } from '@/types/task.types';
import type { User } from '@/types/user.types';
import { PriorityLabels, PRIORITIES } from '@constants/priorities';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { results, isLoading } = useAppSelector((state: any) => state.search);
  const { currentWorkspace } = useAppSelector((state) => state.workspace);
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    assigneeId: '',
    priority: '',
    dueDateFrom: '',
    dueDateTo: '',
  });

  useEffect(() => {
    if (query && currentWorkspace) {
      performSearch();
    }
  }, [query, currentWorkspace]);

  const performSearch = async () => {
    if (!query.trim() || !currentWorkspace) return;
    
    try {
      await dispatch(globalSearch({ workspaceId: currentWorkspace.id, query: query.trim() })).unwrap();
    } catch (error: any) {
      dispatch(showToast({ message: error || 'Search failed', type: 'error' }));
    }
  };

  const performAdvancedSearch = async () => {
    if (!currentWorkspace) return;
    
    try {
      await dispatch(searchTasks({
        workspaceId: currentWorkspace.id,
        filters: {
          query: query.trim() || undefined,
          ...filters,
        }
      })).unwrap();
    } catch (error: any) {
      dispatch(showToast({ message: error || 'Search failed', type: 'error' }));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      setSearchParams({ q: query });
      performSearch();
    }
  };

  const handleAdvancedSearch = () => {
    setSearchParams({ q: query, ...filters });
    performAdvancedSearch();
  };

  const clearFilters = () => {
    setFilters({
      assigneeId: '',
      priority: '',
      dueDateFrom: '',
      dueDateTo: '',
    });
    setShowFilters(false);
    if (query) {
      performSearch();
    }
  };

  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks, projects, comments..."
              className="input-field pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
          <Button type="button" variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} className="mr-1" />
            Filters
          </Button>
        </div>
      </form>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="card mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
              <button onClick={clearFilters} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="input-label">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="input-field"
                >
                  <option value="">All</option>
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>{PriorityLabels[p]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Due Date From</label>
                <input
                  type="date"
                  value={filters.dueDateFrom}
                  onChange={(e) => setFilters({ ...filters, dueDateFrom: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Due Date To</label>
                <input
                  type="date"
                  value={filters.dueDateTo}
                  onChange={(e) => setFilters({ ...filters, dueDateTo: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAdvancedSearch} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : results ? (
        <div className="space-y-8">
          {/* Tasks Results */}
          {results.tasks && results.tasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tasks ({results.tasks.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {results.tasks.map((task: Task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => handleTaskClick(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Comments Results */}
          {results.comments && results.comments.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Comments ({results.comments.length})
              </h2>
                <div className="space-y-3">
                  {results.comments.map((comment: any) => (
                    <div
                      key={comment.id}
                      onClick={() => navigate(`/tasks/${comment.taskId}`)}
                      className="card cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="card-body">
                        <p className="text-sm text-gray-700">{comment.content}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          on task: {comment.taskId}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          )}

          {/* Users Results */}
          {results.users && results.users.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Users ({results.users.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {results.users.map((user: User) => (
                  <div key={user.id} className="card">
                    <div className="card-body flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {results.tasks?.length === 0 && 
           results.projects?.length === 0 && 
           results.comments?.length === 0 && 
           results.users?.length === 0 && query && (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No results found</h3>
              <p className="text-gray-500 mt-1">
                Try searching with different keywords or adjust your filters
              </p>
            </div>
          )}
        </div>
      ) : query && (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Enter a search term to get started</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;