import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModules, useToast } from '../../shared';
import { LoadingSpinner } from '../../shared';

export default function CreateModuleModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { createModule } = useModules();
  const { showToast } = useToast();
  
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objectives: ['']
  });

  const handleAddObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const handleRemoveObjective = (index) => {
    if (formData.objectives.length === 1) {
      showToast({ type: 'warning', message: 'At least one objective is required' });
      return;
    }
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const handleObjectiveChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      showToast({ type: 'error', message: 'Module title is required' });
      return;
    }

    const filteredObjectives = formData.objectives.filter(obj => obj.trim() !== '');
    if (filteredObjectives.length === 0) {
      showToast({ type: 'error', message: 'At least one objective is required' });
      return;
    }

    try {
      setCreating(true);
      
      const moduleData = {
        title: formData.title,
        description: formData.description,
        isActive: false,
        objectives: filteredObjectives.map((obj, index) => ({
          objective: obj,
          position: index + 1
        })),
        slides: []
      };

      const response = await createModule(moduleData);
      console.log('Module created:', response);
      
      const newModuleId = response?.data?.id || response?.id;
      
      if (!newModuleId) {
        console.error('No module ID in response:', response);
        showToast({ type: 'error', message: 'Module created but ID not found' });
        return;
      }
      
      showToast({ type: 'success', message: 'Module created successfully' });
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        objectives: ['']
      });
      
      // Navigate to edit mode to add slides
      navigate(`/admin/modules/${newModuleId}/edit`);
      
    } catch (error) {
      console.error('Error creating module:', error);
      showToast({ type: 'error', message: error.message || 'Failed to create module' });
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (!creating) {
      setFormData({
        title: '',
        description: '',
        objectives: ['']
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Module
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
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Module Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Road Safety Basics"
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={creating}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what students will learn..."
                rows={3}
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={creating}
              />
            </div>

            {/* Learning Objectives */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Learning Objectives *
                </label>
                <button
                  type="button"
                  onClick={handleAddObjective}
                  disabled={creating}
                  className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </button>
              </div>

              <div className="space-y-3">
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-8 h-9 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
                      {index + 1}.
                    </div>
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => handleObjectiveChange(index, e.target.value)}
                      placeholder={`Objective ${index + 1}`}
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={creating}
                    />
                    {formData.objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(index)}
                        disabled={creating}
                        className="flex-shrink-0 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Remove objective"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            type="button"
            onClick={handleClose}
            disabled={creating}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={creating}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Slides
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

