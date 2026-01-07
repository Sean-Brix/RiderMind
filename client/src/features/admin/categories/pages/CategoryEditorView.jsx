import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, Plus, GripVertical, Trash2, Save, CheckSquare, Square } from 'lucide-react';
import { useCategories, useModules, useToast } from '../../shared';
import { LoadingSpinner } from '../../shared';
import ModuleSelectorModal from '../components/ModuleSelectorModal';

// Sortable Module Item Component
function SortableModuleItem({ module, index, onRemove, isSelected, onToggleSelect, selectionMode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `module-${module.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-neutral-800 rounded-lg border ${
        isDragging
          ? 'border-blue-500 shadow-2xl scale-105'
          : isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
          : 'border-gray-200 dark:border-neutral-700 shadow-sm'
      } p-4 transition-shadow hover:shadow-md cursor-default`}
    >
      <div className="flex items-start">
        {/* Checkbox for bulk selection */}
        {selectionMode && (
          <button
            onClick={() => onToggleSelect(module.id)}
            className="flex-shrink-0 mr-3 mt-1"
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <Square className="w-5 h-5 text-gray-400" />
            )}
          </button>
        )}

        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 mr-4 mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Position Number */}
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-semibold text-sm mr-4">
          {index + 1}
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
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(module.id)}
          className="flex-shrink-0 ml-4 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Remove from category"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function CategoryEditorView() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { selectedCategory, fetchCategoryById, reorderCategoryModules, removeModuleFromCategory, bulkRemoveModulesFromCategory, loading: categoryLoading } = useCategories();
  const { modules: allModules, fetchModules } = useModules();
  const { showToast } = useToast();

  const [categoryModules, setCategoryModules] = useState([]);
  const [isModuleSelectorOpen, setIsModuleSelectorOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);

  useEffect(() => {
    fetchCategoryById(parseInt(categoryId));
    fetchModules().catch(err => {
      console.error('CategoryEditorView: Error fetching modules:', err);
    });
  }, [categoryId, fetchCategoryById, fetchModules]);

  useEffect(() => {
    if (selectedCategory?.modules) {
      // Sort modules by position
      const sorted = [...selectedCategory.modules].sort((a, b) => a.position - b.position);
      setCategoryModules(sorted);
    } else {
      setCategoryModules([]);
    }
  }, [selectedCategory]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before activating drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCategoryModules((items) => {
        const oldIndex = items.findIndex((item) => {
          const moduleId = item.module?.id || item.moduleId || item.id;
          return `module-${moduleId}` === active.id;
        });
        const newIndex = items.findIndex((item) => {
          const moduleId = item.module?.id || item.moduleId || item.id;
          return `module-${moduleId}` === over.id;
        });

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update positions
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          position: index
        }));

        setHasChanges(true);
        return updatedItems;
      });
    }
  };

  const handleSaveOrder = async () => {
    try {
      const modulePositions = categoryModules.map((mod, index) => {
        const moduleId = mod.module?.id || mod.moduleId || mod.id;
        return {
          moduleId,
          position: index
        };
      });

      await reorderCategoryModules(parseInt(categoryId), modulePositions);
      showToast({ type: 'success', message: 'Module order saved successfully' });
      setHasChanges(false);
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to save order' });
    }
  };

  const handleRemoveModule = async (moduleId) => {
    try {
      await removeModuleFromCategory(parseInt(categoryId), moduleId);
      showToast({ type: 'success', message: 'Module removed from category' });
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to remove module' });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedModuleIds.length === 0) return;

    try {
      // Bulk remove all selected modules in one request
      await bulkRemoveModulesFromCategory(parseInt(categoryId), selectedModuleIds);
      
      showToast({ 
        type: 'success', 
        message: `${selectedModuleIds.length} module(s) removed from category` 
      });
      setSelectedModuleIds([]);
      setSelectionMode(false);
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to remove modules' });
    }
  };

  const handleToggleSelect = (moduleId) => {
    setSelectedModuleIds(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedModuleIds.length === categoryModules.length) {
      setSelectedModuleIds([]);
    } else {
      const allIds = categoryModules.map(cm => cm.module?.id || cm.moduleId || cm.id);
      setSelectedModuleIds(allIds);
    }
  };

  const getAvailableModules = () => {
    const assignedModuleIds = categoryModules.map(cm => {
      const moduleId = cm.module?.id || cm.moduleId || cm.id;
      return moduleId;
    }).filter(Boolean); // Remove any undefined/null values
    
    // Filter modules to only show those with quizzes attached and not already assigned
    const available = allModules.filter(m => 
      !assignedModuleIds.includes(m.id) && 
      m.quizzes && 
      m.quizzes.length > 0
    );
    return available;
  };

  if (categoryLoading && !selectedCategory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedCategory?.name || 'Category'} Lessons
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {categoryModules.length} modules assigned • Drag to reorder
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/admin/categories')}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            {hasChanges && (
              <button
                onClick={handleSaveOrder}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Order
              </button>
            )}
          </div>
        </div>
        {/* Action Buttons */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setIsModuleSelectorOpen(true)}
            className="flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Modules
          </button>
          
          {categoryModules.length > 0 && (
            <>
              {!selectionMode ? (
                <button
                  onClick={() => setSelectionMode(true)}
                  className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Select
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSelectAll}
                    className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {selectedModuleIds.length === categoryModules.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={selectedModuleIds.length === 0}
                    className="px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete ({selectedModuleIds.length})
                  </button>
                  <button
                    onClick={() => {
                      setSelectionMode(false);
                      setSelectedModuleIds([]);
                    }}
                    className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Modules List */}
        {categoryModules.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No modules assigned to this category yet
            </p>
            <button
              onClick={() => setIsModuleSelectorOpen(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Module
            </button>
          </div>
        ) : (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={categoryModules.map(cm => {
                const moduleId = cm.module?.id || cm.moduleId || cm.id;
                return `module-${moduleId}`;
              })}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {categoryModules.map((categoryModule, index) => {
                  const module = categoryModule.module || categoryModule;
                  const moduleId = module.id || categoryModule.moduleId;
                  return (
                    <SortableModuleItem
                      key={moduleId}
                      module={{ ...module, id: moduleId }}
                      index={index}
                      onRemove={handleRemoveModule}
                      isSelected={selectedModuleIds.includes(moduleId)}
                      onToggleSelect={handleToggleSelect}
                      selectionMode={selectionMode}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {hasChanges && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              You have unsaved changes. Click "Save Order" to apply the new module order.
            </p>
          </div>
        )}
      </div>

      {/* Module Selector Modal */}
      <ModuleSelectorModal
        isOpen={isModuleSelectorOpen}
        onClose={() => setIsModuleSelectorOpen(false)}
        categoryId={parseInt(categoryId)}
        availableModules={getAvailableModules()}
      />
    </div>
  );
}

