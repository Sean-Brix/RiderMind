import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Filter } from 'lucide-react';
import { useModules, useToast } from '../../shared';
import { LoadingSpinner, SearchBar } from '../../shared';

export default function ModulesListView() {
  const navigate = useNavigate();
  const { modules, loading, error, fetchModules, deleteModule } = useModules();
  const { showToast } = useToast();

  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedModules, setSelectedModules] = useState([]);

  console.log('ModulesListView: Rendering', { modules, loading, error });

  // Load modules on mount
  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const availableFilters = [
    {
      name: 'hasQuiz',
      label: 'Quiz Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Has Quiz' },
        { value: 'false', label: 'No Quiz' }
      ]
    },
    {
      name: 'isActive',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    },
    {
      name: 'hasCategory',
      label: 'Category',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Assigned' },
        { value: 'false', label: 'Not Assigned' }
      ]
    }
  ];

  // Filter and search modules
  const filteredModules = useMemo(() => {
    let result = modules || [];

    // Search filter
    if (searchValue) {
      const search = searchValue.toLowerCase();
      result = result.filter(
        (module) =>
          module.title?.toLowerCase().includes(search) ||
          module.description?.toLowerCase().includes(search)
      );
    }

    // Quiz filter
    if (filters.hasQuiz) {
      const hasQuiz = filters.hasQuiz === 'true';
      result = result.filter((module) => {
        const moduleHasQuiz = module.quizzes && module.quizzes.length > 0;
        return moduleHasQuiz === hasQuiz;
      });
    }

    // Status filter
    if (filters.isActive) {
      const isActive = filters.isActive === 'true';
      result = result.filter((module) => module.isActive === isActive);
    }

    // Category assignment filter
    if (filters.hasCategory) {
      const hasCategory = filters.hasCategory === 'true';
      result = result.filter((module) => {
        const moduleHasCategory = module.categoryModules && module.categoryModules.length > 0;
        return moduleHasCategory === hasCategory;
      });
    }

    return result;
  }, [modules, searchValue, filters]);

  const handleCreateModule = () => {
    navigate('/admin/modules/new');
  };

  const handleEditModule = (moduleId) => {
    navigate(`/admin/modules/${moduleId}/edit`);
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      await deleteModule(moduleId);
      showToast({ type: 'success', message: 'Module deleted successfully' });
      setSelectedModules((prev) => prev.filter((id) => id !== moduleId));
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to delete module' });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedModules.length === 0) return;

    const confirm = window.confirm(
      `Delete ${selectedModules.length} module(s)? This cannot be undone.`
    );

    if (!confirm) return;

    try {
      await Promise.all(selectedModules.map((id) => deleteModule(id)));
      showToast({
        type: 'success',
        message: `Deleted ${selectedModules.length} module(s)`
      });
      setSelectedModules([]);
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to delete some modules' });
    }
  };

  const toggleSelectModule = (moduleId) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedModules.length === filteredModules.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(filteredModules.map((m) => m.id));
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="font-semibold">Error loading modules</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-900 p-6">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
        {/* Search and Filters */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                filters={filters}
                onFilterChange={setFilters}
                availableFilters={availableFilters}
                placeholder="Search modules by title or description..."
              />
            </div>
            <button
              onClick={handleCreateModule}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Module</span>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedModules.length > 0 && (
          <div className="px-4 py-3 bg-brand-50 dark:bg-brand-900/10 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              {selectedModules.length} module(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 rounded transition-colors"
              >
                {selectedModules.length === filteredModules.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full mb-4">
              <Plus className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              {searchValue || Object.keys(filters).length > 0
                ? 'No modules match your filters'
                : 'No modules yet'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              {searchValue || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first learning module'}
            </p>
            {!searchValue && Object.keys(filters).length === 0 && (
              <button
                onClick={handleCreateModule}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
              >
                <Plus className="w-4 h-4" />
                Create your first module
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
                  <tr>
                    <th className="w-12 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedModules.length === filteredModules.length && filteredModules.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-neutral-300 dark:border-neutral-600"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider" style={{width: '30%'}}>
                      Module
                    </th>
                    <th className="w-28 px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                      No. of Slides
                    </th>
                    <th className="w-28 px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                      Quiz
                    </th>
                    <th className="w-48 px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="w-28 px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {filteredModules.map((module) => (
                    <tr 
                      key={module.id} 
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <td className="px-4 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedModules.includes(module.id)}
                          onChange={() => toggleSelectModule(module.id)}
                          className="rounded border-neutral-300 dark:border-neutral-600"
                        />
                      </td>
                      <td className="px-4 py-4 text-left">
                        <div className="flex flex-col">
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">
                            {module.title}
                          </span>
                          {module.description && (
                            <span className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1 mt-0.5">
                              {module.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-left">
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                          {module.slides?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-left">
                        {module.quizzes && module.quizzes.length > 0 ? (
                          <button
                            onClick={() => navigate('/admin/quizes')}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors cursor-pointer"
                            title="View quiz"
                          >
                            Has Quiz
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300">
                            No Quiz
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-left">
                        {module.categoryModules && module.categoryModules.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {module.categoryModules.map((cm) => (
                              <span
                                key={cm.category.id}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              >
                                {cm.category.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Not assigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditModule(module.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Edit module"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteModule(module.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete module"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
