import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useQuizzes, useToast } from '../../shared';
import { LoadingSpinner, SearchBar } from '../../shared';

export default function Quizes() {
  const navigate = useNavigate();
  const { quizzes, loading, error, fetchQuizzes, deleteQuiz } = useQuizzes();
  const { showToast } = useToast();

  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);

  // Load quizzes on mount
  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const availableFilters = [
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
      name: 'hasModule',
      label: 'Module',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Assigned' },
        { value: 'false', label: 'Standalone' }
      ]
    }
  ];

  // Filter and search quizzes
  const filteredQuizzes = useMemo(() => {
    let result = quizzes || [];

    // Search filter
    if (searchValue) {
      const search = searchValue.toLowerCase();
      result = result.filter(
        (quiz) =>
          quiz.title?.toLowerCase().includes(search) ||
          quiz.description?.toLowerCase().includes(search) ||
          quiz.module?.title?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (filters.isActive) {
      const isActive = filters.isActive === 'true';
      result = result.filter((quiz) => quiz.isActive === isActive);
    }

    // Module assignment filter
    if (filters.hasModule) {
      const hasModule = filters.hasModule === 'true';
      result = result.filter((quiz) => {
        const quizHasModule = quiz.moduleId != null;
        return quizHasModule === hasModule;
      });
    }

    return result;
  }, [quizzes, searchValue, filters]);

  const handleCreateQuiz = () => {
    navigate('/admin/quizes/new');
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/admin/quizes/${quizId}/edit`);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('Delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteQuiz(quizId);
      showToast({ type: 'success', message: 'Quiz deleted successfully' });
      setSelectedQuizzes((prev) => prev.filter((id) => id !== quizId));
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to delete quiz' });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuizzes.length === 0) return;

    const confirm = window.confirm(
      `Delete ${selectedQuizzes.length} quiz(zes)? This cannot be undone.`
    );

    if (!confirm) return;

    try {
      await Promise.all(selectedQuizzes.map((id) => deleteQuiz(id)));
      showToast({
        type: 'success',
        message: `Deleted ${selectedQuizzes.length} quiz(zes)`
      });
      setSelectedQuizzes([]);
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to delete some quizzes' });
    }
  };

  const toggleSelectQuiz = (quizId) => {
    setSelectedQuizzes((prev) =>
      prev.includes(quizId) ? prev.filter((id) => id !== quizId) : [...prev, quizId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedQuizzes.length === filteredQuizzes.length) {
      setSelectedQuizzes([]);
    } else {
      setSelectedQuizzes(filteredQuizzes.map((q) => q.id));
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="font-semibold">Error loading quizzes</p>
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
                placeholder="Search quizzes by title, description, or module..."
              />
            </div>
            <button
              onClick={handleCreateQuiz}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Quiz</span>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedQuizzes.length > 0 && (
          <div className="px-4 py-3 bg-brand-50 dark:bg-brand-900/10 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              {selectedQuizzes.length} quiz(zes) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 rounded transition-colors"
              >
                {selectedQuizzes.length === filteredQuizzes.length ? 'Deselect All' : 'Select All'}
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
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full mb-4">
              <Plus className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              {searchValue || Object.keys(filters).length > 0
                ? 'No quizzes match your filters'
                : 'No quizzes yet'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              {searchValue || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first quiz'}
            </p>
            {!searchValue && Object.keys(filters).length === 0 && (
              <button
                onClick={handleCreateQuiz}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
              >
                <Plus className="w-4 h-4" />
                Create your first quiz
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
                      checked={selectedQuizzes.length === filteredQuizzes.length && filteredQuizzes.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-neutral-300 dark:border-neutral-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider" style={{width: '30%'}}>
                    Quiz
                  </th>
                  <th className="w-28 px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="w-28 px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                    Pass Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider" style={{width: '25%'}}>
                    Module
                  </th>
                  <th className="w-28 px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="w-28 px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {filteredQuizzes.map((quiz) => (
                  <tr 
                    key={quiz.id} 
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="px-4 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedQuizzes.includes(quiz.id)}
                        onChange={() => toggleSelectQuiz(quiz.id)}
                        className="rounded border-neutral-300 dark:border-neutral-600"
                      />
                    </td>
                    <td className="px-4 py-4 text-left">
                      <div className="flex flex-col">
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {quiz.title}
                        </span>
                        {quiz.description && (
                          <span className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1 mt-0.5">
                            {quiz.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-left">
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {quiz.questions?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-left">
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {quiz.passingScore}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-left">
                      {quiz.module ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {quiz.module.title}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300">
                          Standalone
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-left">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          quiz.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {quiz.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-left">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditQuiz(quiz.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Edit quiz"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete quiz"
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
