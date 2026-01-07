import { useState } from 'react';
import { X, Search, Plus, Check, CheckSquare, Square, Filter } from 'lucide-react';
import { useCategories, useToast } from '../../shared';

export default function ModuleSelectorModal({ isOpen, onClose, categoryId, availableModules }) {
  const { bulkAddModulesToCategory } = useCategories();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModules, setSelectedModules] = useState([]);
  const [adding, setAdding] = useState(false);
  const [quickFilter, setQuickFilter] = useState('all'); // 'all', 'with-quiz', 'no-quiz'

  const filteredModules = availableModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = quickFilter === 'all' ? true :
      quickFilter === 'with-quiz' ? (module.quizzes && module.quizzes.length > 0) :
      quickFilter === 'no-quiz' ? (!module.quizzes || module.quizzes.length === 0) : true;
    
    return matchesSearch && matchesFilter;
  });

  const toggleModule = (moduleId) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredModules.map(m => m.id);
    setSelectedModules(allFilteredIds);
  };

  const handleClearAll = () => {
    setSelectedModules([]);
  };

  const handleAddModules = async () => {
    if (selectedModules.length === 0) {
      showToast({ type: 'warning', message: 'Please select at least one module' });
      return;
    }

    setAdding(true);
    try {
      // Bulk add all modules in one request
      await bulkAddModulesToCategory(categoryId, selectedModules);
      
      showToast({ 
        type: 'success', 
        message: `${selectedModules.length} module(s) added successfully` 
      });
      setSelectedModules([]);
      setSearchQuery('');
      onClose();
    } catch (error) {
      console.error('Error adding modules:', error);
      showToast({ type: 'error', message: error.message || 'Failed to add modules' });
    } finally {
      setAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Add Modules to Category
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select modules to add to this category
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Controls */}
        <div className="p-6 border-b border-gray-200 dark:border-neutral-700 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search modules..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuickFilter('all')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  quickFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All ({availableModules.length})
              </button>
              <button
                onClick={() => setQuickFilter('with-quiz')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  quickFilter === 'with-quiz'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                With Quiz ({availableModules.filter(m => m.quizzes?.length > 0).length})
              </button>
              <button
                onClick={() => setQuickFilter('no-quiz')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  quickFilter === 'no-quiz'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                No Quiz ({availableModules.filter(m => !m.quizzes || m.quizzes.length === 0).length})
              </button>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                disabled={filteredModules.length === 0}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckSquare className="w-4 h-4 mr-1.5" />
                Select All Visible
              </button>
              <button
                onClick={handleClearAll}
                disabled={selectedModules.length === 0}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Square className="w-4 h-4 mr-1.5" />
                Clear All
              </button>
            </div>
            {selectedModules.length > 0 && (
              <div className="flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {selectedModules.length} selected
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredModules.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No modules found matching your search' : 'No available modules with quizzes'}
              </p>
              {!searchQuery && (
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Only modules with attached quizzes can be added to categories
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredModules.map((module) => {
                const isSelected = selectedModules.includes(module.id);
                return (
                  <button
                    key={module.id}
                    onClick={() => toggleModule(module.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-start">
                      {/* Checkbox */}
                      <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mr-3 mt-0.5 ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 dark:border-neutral-600'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>

                      {/* Module Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                          {module.title}
                        </h3>
                        {module.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {module.description}
                          </p>
                        )}
                        <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400 space-x-4">
                          <span>Duration: {module.duration || 0} min</span>
                          <span>•</span>
                          <span>{module.objectives?.length || 0} objectives</span>
                          <span>•</span>
                          <span>{module.slides?.length || 0} slides</span>
                          {module.quizzes && module.quizzes.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Has Quiz
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddModules}
            disabled={selectedModules.length === 0 || adding}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {adding ? 'Adding...' : `Add ${selectedModules.length || ''} Module${selectedModules.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

