import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Eye, Plus, X } from 'lucide-react';
import { useModules, useToast } from '../../shared';
import { LoadingSpinner, NavigationHeader } from '../../shared';

export default function ModuleEditor() {
  const navigate = useNavigate();
  const { moduleId } = useParams(); // 'new' or actual ID
  const { fetchModuleById, createModule, updateModule, deleteModule } = useModules();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    objectives: [''],
    isActive: false
  });

  const isNewModule = moduleId === 'new';

  // Load existing module data
  useEffect(() => {
    if (!isNewModule) {
      loadModule();
    }
  }, [moduleId]);

  const loadModule = async () => {
    try {
      setLoading(true);
      const response = await fetchModuleById(moduleId);
      const module = response.data;
      
      setModuleForm({
        title: module.title || '',
        description: module.description || '',
        objectives: module.objectives && module.objectives.length > 0
          ? module.objectives.map(obj => obj.objective)
          : [''],
        isActive: module.isActive || false
      });
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to load module' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!moduleForm.title.trim()) {
      showToast({ type: 'error', message: 'Module title is required' });
      return;
    }

    const filteredObjectives = moduleForm.objectives.filter(obj => obj.trim() !== '');
    if (filteredObjectives.length === 0) {
      showToast({ type: 'error', message: 'At least one objective is required' });
      return;
    }

    try {
      setSaving(true);
      
      const moduleData = {
        title: moduleForm.title,
        description: moduleForm.description,
        isActive: moduleForm.isActive,
        objectives: filteredObjectives.map((obj, index) => ({
          objective: obj,
          position: index + 1
        }))
      };

      if (isNewModule) {
        const response = await createModule(moduleData);
        showToast({ type: 'success', message: 'Module created successfully' });
        navigate(`/admin/modules/${response.data.id}/edit`);
      } else {
        await updateModule(moduleId, moduleData);
        showToast({ type: 'success', message: 'Module updated successfully' });
      }
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to save module' });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteModule(moduleId);
      showToast({ type: 'success', message: 'Module deleted successfully' });
      navigate('/admin/modules');
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to delete module' });
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleObjectiveChange = (index, value) => {
    const newObjectives = [...moduleForm.objectives];
    newObjectives[index] = value;
    setModuleForm(prev => ({ ...prev, objectives: newObjectives }));
  };

  const handleAddObjective = () => {
    setModuleForm(prev => ({ ...prev, objectives: [...prev.objectives, ''] }));
  };

  const handleRemoveObjective = (index) => {
    if (moduleForm.objectives.length === 1) {
      showToast({ type: 'warning', message: 'At least one objective is required' });
      return;
    }
    const newObjectives = moduleForm.objectives.filter((_, i) => i !== index);
    setModuleForm(prev => ({ ...prev, objectives: newObjectives }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/modules')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isNewModule ? 'Create New Module' : 'Edit Module'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isNewModule ? 'Create a new learning module' : 'Modify module details and objectives'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isNewModule && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Module'}
            </button>
          </div>
        </div>

        {/* Basic Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Module Title *
              </label>
              <input
                type="text"
                value={moduleForm.title}
                onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Road Safety Basics"
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={moduleForm.description}
                onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what students will learn..."
                rows={3}
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={moduleForm.isActive}
                onChange={(e) => setModuleForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Module is active (visible to students)
              </label>
            </div>
          </div>
        </div>

        {/* Learning Objectives Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Learning Objectives
            </h2>
            <button
              onClick={handleAddObjective}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Objective
            </button>
          </div>

          <div className="space-y-3">
            {moduleForm.objectives.map((objective, index) => (
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
                />
                {moduleForm.objectives.length > 1 && (
                  <button
                    onClick={() => handleRemoveObjective(index)}
                    className="flex-shrink-0 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Remove objective"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Slides Section - Placeholder for now */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Slides
          </h2>
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Slide management coming soon
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              For now, save the module to access slide editing in the legacy interface
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
