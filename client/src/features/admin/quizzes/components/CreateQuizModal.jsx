import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModules, useQuizzes, useToast } from '../../shared';
import { LoadingSpinner } from '../../shared';

export default function CreateQuizModal({ isOpen, onClose, preSelectedModuleId = null }) {
  const navigate = useNavigate();
  const { modules, fetchModules } = useModules();
  const { quizzes, createQuiz } = useQuizzes();
  const { showToast } = useToast();
  
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    moduleId: '',
    passingScore: 70,
    isActive: false
  });

  useEffect(() => {
    if (isOpen) {
      fetchModules();
      // Set pre-selected module if provided
      if (preSelectedModuleId) {
        setFormData(prev => ({ ...prev, moduleId: String(preSelectedModuleId) }));
      }
    }
  }, [isOpen, fetchModules, preSelectedModuleId]);

  // Filter modules that don't have a quiz
  const availableModules = modules.filter(module => {
    return !quizzes.some(quiz => quiz.moduleId === module.id);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      showToast({ type: 'error', message: 'Quiz title is required' });
      return;
    }

    if (!formData.moduleId) {
      showToast({ type: 'error', message: 'Please select a module' });
      return;
    }

    if (formData.passingScore < 0 || formData.passingScore > 100) {
      showToast({ type: 'error', message: 'Passing score must be between 0 and 100' });
      return;
    }

    try {
      setCreating(true);
      
      const quizData = {
        title: formData.title,
        moduleId: parseInt(formData.moduleId),
        passingScore: parseInt(formData.passingScore),
        isActive: formData.isActive,
        questions: []
      };

      const response = await createQuiz(quizData);
      console.log('Quiz created:', response);
      
      const newQuizId = response?.data?.id || response?.id;
      
      if (!newQuizId) {
        console.error('No quiz ID in response:', response);
        showToast({ type: 'error', message: 'Quiz created but ID not found' });
        return;
      }
      
      showToast({ type: 'success', message: 'Quiz created successfully' });
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        moduleId: '',
        passingScore: 70,
        isActive: false
      });
      
      // Navigate to edit mode to add questions
      navigate(`/admin/quizes/${newQuizId}/edit`);
      
    } catch (error) {
      console.error('Error creating quiz:', error);
      showToast({ type: 'error', message: error.message || 'Failed to create quiz' });
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (!creating) {
      setFormData({
        title: '',
        moduleId: '',
        passingScore: 70,
        isActive: false
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Quiz
          </h2>
          <button
            onClick={handleClose}
            disabled={creating}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {availableModules.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                All Modules Have Quizzes
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Every module already has an associated quiz. Create a new module first if you want to add more quizzes.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Module Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Module *
                </label>
                <select
                  value={formData.moduleId}
                  onChange={(e) => setFormData(prev => ({ ...prev, moduleId: e.target.value }))}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={creating}
                  required
                >
                  <option value="">Choose a module...</option>
                  {availableModules.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Only modules without quizzes are shown ({availableModules.length} available)
                </p>
              </div>

              {/* Quiz Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Road Safety Knowledge Check"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={creating}
                  required
                />
              </div>

              {/* Passing Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Passing Score (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={(e) => setFormData(prev => ({ ...prev, passingScore: e.target.value }))}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={creating}
                  required
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={creating}
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Make quiz active immediately
                </label>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        {availableModules.length > 0 && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button
              type="button"
              onClick={handleClose}
              disabled={creating}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={creating}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating...
                </>
              ) : (
                'Add Questions'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

