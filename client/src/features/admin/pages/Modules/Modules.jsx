import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LessonModal from '../../../../components/LessonModal';
import { ModuleListItem, ActiveModuleItem, DroppableArea, FileUpload } from './components';
import * as moduleService from '../../../../services/moduleService';
import * as categoryService from '../../../../services/categoryService';

// Sortable Slide Item Component
function SortableSlideItem({ slide, index, isEditingModule, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `slide-${index}`, disabled: !isEditingModule });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
        isDragging 
          ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-500 shadow-xl scale-105' 
          : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600'
      }`}
    >
      {isEditingModule && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-brand-100 dark:hover:bg-brand-900/30 rounded transition-colors flex-shrink-0"
          title="Drag to reorder"
        >
          <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      )}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold text-sm">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate">
          {slide.title || 'Untitled Slide'}
        </h4>
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="capitalize">{slide.type}</span>
          {slide.skillLevel && (
            <>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                slide.skillLevel === 'Beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                slide.skillLevel === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {slide.skillLevel}
              </span>
            </>
          )}
        </div>
      </div>
      {isEditingModule && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(index)}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            title="Edit slide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(index)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete slide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default function Modules() {
  const [activeTab, setActiveTab] = useState('order');
  const [activeModules, setActiveModules] = useState([]);
  const [savedModules, setSavedModules] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeId, setActiveId] = useState(null);
  
  // Category state
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryVehicleType, setNewCategoryVehicleType] = useState('MOTORCYCLE');
  
  // All modules data
  const [allModules, setAllModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit Module Tab State
  const [selectedModuleId, setSelectedModuleId] = useState(null); // null = not selected, 'new' = create new, number = edit existing
  const [isEditingModule, setIsEditingModule] = useState(false); // Whether the selected module is in edit mode
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    objectives: [''],
    slides: [],
  });
  const [editingSlideIndex, setEditingSlideIndex] = useState(null); // Which slide is being edited
  const [slideForm, setSlideForm] = useState({
    type: 'text',
    title: '',
    content: '',
    description: '',
    skillLevel: 'Beginner', // Skill level for the slide
    file: null, // For file uploads
  });
  
  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Slide drag-and-drop state
  const [activeSlideId, setActiveSlideId] = useState(null);

  // Load all modules on component mount
  useEffect(() => {
    loadModules();
    loadCategories();
  }, []);

  async function loadModules() {
    try {
      setLoading(true);
      setError(null);
      const response = await moduleService.getAllModules({
        includeObjectives: true,
        includeSlides: true
      });
      
      setAllModules(response.data);
      
      // Set active modules (isActive = true)
      const active = response.data.filter(m => m.isActive);
      setActiveModules(active);
      setSavedModules(active);
    } catch (err) {
      console.error('Failed to load modules:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const response = await categoryService.getAllCategories({ isActive: true });
      setCategories(response.data);
      
      // Set default category as selected
      const defaultCategory = response.data.find(cat => cat.isDefault);
      if (defaultCategory) {
        setSelectedCategoryId(defaultCategory.id);
        loadCategoryModules(defaultCategory.id);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  async function loadCategoryModules(categoryId) {
    try {
      const response = await categoryService.getCategoryById(categoryId);
      const categoryModules = response.data.modules.map(cm => ({
        ...cm.module,
        categoryPosition: cm.position
      }));
      setActiveModules(categoryModules);
      setSavedModules(categoryModules);
    } catch (err) {
      console.error('Failed to load category modules:', err);
    }
  }

  async function handleCategoryChange(categoryId) {
    if (hasChanges) {
      if (!confirm('You have unsaved changes. Do you want to switch categories without saving?')) {
        return;
      }
    }
    setSelectedCategoryId(categoryId);
    loadCategoryModules(categoryId);
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      const response = await categoryService.createCategory({
        name: newCategoryName.trim(),
        vehicleType: newCategoryVehicleType,
        isActive: true
      });
      
      setCategories([...categories, response.data]);
      setSelectedCategoryId(response.data.id);
      setNewCategoryName('');
      setNewCategoryVehicleType('MOTORCYCLE');
      setIsCreatingCategory(false);
      setActiveModules([]);
      setSavedModules([]);
      alert('Category created successfully!');
    } catch (err) {
      console.error('Failed to create category:', err);
      alert('Failed to create category: ' + err.message);
    }
  }

  async function handleSaveOrder() {
    if (!selectedCategoryId) {
      alert('Please select a category first');
      return;
    }

    try {
      const moduleIds = activeModules.map(m => m.id);
      await categoryService.assignModulesToCategory(selectedCategoryId, moduleIds);
      
      setSavedModules([...activeModules]);
      setIsEditMode(false);
      alert('Module order saved successfully!');
    } catch (err) {
      console.error('Failed to save order:', err);
      alert('Failed to save order: ' + err.message);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get available modules (not yet active)
  const availableModules = allModules.filter(
    module => !activeModules.find(am => am.id === module.id)
  );

  const hasChanges = JSON.stringify(activeModules) !== JSON.stringify(savedModules);

  function handleCancelEdit() {
    setActiveModules([...savedModules]);
    setIsEditMode(false);
  }

  function handleEnterEditMode() {
    setIsEditMode(true);
  }
  
  // Edit Module Tab Handlers
  function handleCreateNewModule() {
    setSelectedModuleId('new');
    setIsEditingModule(true); // Automatically enter edit mode for new modules
    setModuleForm({
      title: '',
      description: '',
      objectives: [''],
      slides: [],
    });
    setEditingSlideIndex(null);
  }

  async function handleSelectModule(moduleId) {
    try {
      setSelectedModuleId(moduleId);
      setIsEditingModule(false); // View mode by default
      const response = await moduleService.getModuleById(moduleId);
      const module = response.data;
      
      if (module) {
        setModuleForm({
          title: module.title,
          description: module.description || '',
          objectives: module.objectives && module.objectives.length > 0 
            ? module.objectives.map(obj => obj.objective)
            : [''],
          slides: module.slides || [],
        });
      }
      setEditingSlideIndex(null);
    } catch (err) {
      console.error('Failed to load module:', err);
      alert('Failed to load module: ' + err.message);
    }
  }

  function handleEditModule() {
    setIsEditingModule(true);
  }

  function handleCancelModuleEdit() {
    if (editingSlideIndex !== null) {
      alert('Please save or cancel the slide you are editing first.');
      return;
    }
    
    if (selectedModuleId === 'new') {
      // If canceling new module creation, clear selection
      setSelectedModuleId(null);
      setIsEditingModule(false);
      setModuleForm({
        title: '',
        description: '',
        objectives: [''],
        slides: [],
      });
    } else {
      // If canceling edit of existing module, reload the module data and exit edit mode
      setIsEditingModule(false);
      handleSelectModule(selectedModuleId);
    }
  }

  function handleModuleFormChange(field, value) {
    setModuleForm(prev => ({ ...prev, [field]: value }));
  }

  function handleObjectiveChange(index, value) {
    const newObjectives = [...moduleForm.objectives];
    newObjectives[index] = value;
    setModuleForm(prev => ({ ...prev, objectives: newObjectives }));
  }

  function handleAddObjective() {
    setModuleForm(prev => ({ ...prev, objectives: [...prev.objectives, ''] }));
  }

  function handleRemoveObjective(index) {
    if (moduleForm.objectives.length === 1) return; // Keep at least one
    const newObjectives = moduleForm.objectives.filter((_, i) => i !== index);
    setModuleForm(prev => ({ ...prev, objectives: newObjectives }));
  }

  function handleAddSlide() {
    setEditingSlideIndex(moduleForm.slides.length);
    setSlideForm({
      type: 'text',
      title: '',
      content: '',
      description: '',
      skillLevel: 'Beginner',
      file: null,
    });
  }

  function handleEditSlide(index) {
    setEditingSlideIndex(index);
    setSlideForm(moduleForm.slides[index]);
  }

  function handleSlideFormChange(field, value) {
    setSlideForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSaveSlide() {
    const newSlides = [...moduleForm.slides];
    if (editingSlideIndex === moduleForm.slides.length) {
      // Adding new slide
      newSlides.push(slideForm);
    } else {
      // Editing existing slide - preserve the ID if it exists
      const existingSlide = moduleForm.slides[editingSlideIndex];
      newSlides[editingSlideIndex] = {
        ...slideForm,
        id: existingSlide?.id, // Preserve existing slide ID
      };
    }
    setModuleForm(prev => ({ ...prev, slides: newSlides }));
    setEditingSlideIndex(null);
    setSlideForm({
      type: 'text',
      title: '',
      content: '',
      description: '',
      file: null,
    });
  }

  function handleCancelSlideEdit() {
    setEditingSlideIndex(null);
    setSlideForm({
      type: 'text',
      title: '',
      content: '',
      description: '',
      skillLevel: 'Beginner',
      file: null,
    });
  }

  function handleDeleteSlide(index) {
    const newSlides = moduleForm.slides.filter((_, i) => i !== index);
    setModuleForm(prev => ({ ...prev, slides: newSlides }));
    if (editingSlideIndex === index) {
      setEditingSlideIndex(null);
    }
  }

  async function handleSaveModule() {
    try {
      setIsSaving(true);
      
      // Prepare module data
      const moduleData = {
        title: moduleForm.title,
        description: moduleForm.description,
        isActive: false, // New modules are inactive by default
        objectives: moduleForm.objectives
          .filter(obj => obj.trim() !== '')
          .map((obj, index) => ({
            objective: obj,
            position: index + 1
          }))
      };

      let savedModule;
      
      if (selectedModuleId === 'new') {
        // Create new module
        const response = await moduleService.createModule(moduleData);
        savedModule = response.data;
        alert('Module created successfully!');
      } else {
        // Update existing module
        const response = await moduleService.updateModule(selectedModuleId, moduleData);
        savedModule = response.data;
        alert('Module updated successfully!');
      }

      // Handle slides - need to save/update them individually
      for (let i = 0; i < moduleForm.slides.length; i++) {
        const slide = moduleForm.slides[i];
        const slideData = {
          type: slide.type,
          title: slide.title,
          content: slide.type === 'text' ? slide.content : '', // Only text slides have content in DB
          description: slide.description,
          position: i + 1,
          imageFile: slide.type === 'image' ? slide.file : undefined // Include image file for conversion
        };

        if (slide.id) {
          // Update existing slide
          await moduleService.updateSlide(slide.id, slideData);
          
          // Upload new video if file exists (replacement)
          if (slide.type === 'video' && slide.file) {
            await moduleService.uploadSlideVideo(slide.id, slide.file);
          }
        } else {
          // Create new slide
          const newSlideResponse = await moduleService.addSlide(savedModule.id, slideData);
          
          // Upload video if file exists
          if (slide.type === 'video' && slide.file) {
            await moduleService.uploadSlideVideo(newSlideResponse.data.id, slide.file);
          }
        }
      }

      // Reload modules
      await loadModules();
      
      // Reset form
      setSelectedModuleId(null);
      setModuleForm({
        title: '',
        description: '',
        objectives: [''],
        slides: [],
      });
    } catch (err) {
      console.error('Failed to save module:', err);
      alert('Failed to save module: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancelModuleEdit() {
    if (editingSlideIndex !== null) {
      alert('Please save or cancel the slide you are editing first.');
      return;
    }
    
    setSelectedModuleId(null);
    setModuleForm({
      title: '',
      description: '',
      objectives: [''],
      slides: [],
    });
  }

  async function handleDeleteModule() {
    if (!window.confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await moduleService.deleteModule(selectedModuleId);
      alert('Module deleted successfully!');
      
      // Reload modules
      await loadModules();
      
      // Reset form
      setSelectedModuleId(null);
      setModuleForm({
        title: '',
        description: '',
        objectives: [''],
        slides: [],
      });
    } catch (err) {
      console.error('Failed to delete module:', err);
      alert('Failed to delete module: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;
    if (!isEditMode) return; // Only allow drag in edit mode

    const draggedModule = allModules.find(m => m.id === active.id);
    const isFromAvailable = availableModules.find(m => m.id === active.id);
    const isFromActive = activeModules.find(m => m.id === active.id);
    const isOverAvailable = availableModules.find(m => m.id === over.id);
    const isOverActive = activeModules.find(m => m.id === over.id);

    // Scenario 1: Dragging from available to active (adding module)
    if (isFromAvailable && !isFromActive) {
      if (isOverActive) {
        // Insert at specific position before the module we're hovering over
        const overIndex = activeModules.findIndex(m => m.id === over.id);
        const newActive = [...activeModules];
        newActive.splice(overIndex, 0, draggedModule);
        setActiveModules(newActive);
      } else if (over.id === 'active-droppable') {
        // Dropped on the active droppable area (could be empty)
        setActiveModules([...activeModules, draggedModule]);
      }
    }
    // Scenario 2: Dragging from active back to available (removing module)
    else if (isFromActive && !isFromAvailable) {
      // Check if dropped over available area
      if (isOverAvailable || over.id === 'available-droppable') {
        // Remove from active modules
        setActiveModules(activeModules.filter(m => m.id !== active.id));
      } else if (isOverActive && active.id !== over.id) {
        // Reordering within active modules
        const oldIndex = activeModules.findIndex(m => m.id === active.id);
        const newIndex = activeModules.findIndex(m => m.id === over.id);
        setActiveModules(arrayMove(activeModules, oldIndex, newIndex));
      }
    }
  }

  // Slide drag-and-drop handlers
  function handleSlideDragStart(event) {
    setActiveSlideId(event.active.id);
  }

  function handleSlideDragEnd(event) {
    const { active, over } = event;
    setActiveSlideId(null);

    if (!over || !isEditingModule) return;
    if (active.id === over.id) return;

    const oldIndex = parseInt(active.id.replace('slide-', ''));
    const newIndex = parseInt(over.id.replace('slide-', ''));

    const newSlides = arrayMove(moduleForm.slides, oldIndex, newIndex);
    setModuleForm(prev => ({ ...prev, slides: newSlides }));
  }

  return (
    <div className="p-6">
      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-neutral-200 dark:border-neutral-700 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading modules...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100">Failed to load modules</h3>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
            <button
              onClick={loadModules}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-neutral-200 dark:border-neutral-700">
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex gap-1 p-1">
            <button
              onClick={() => setActiveTab('order')}
              className={`flex-1 px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'order'
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Active Modules
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'new'
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Edit Modules
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'order' ? (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
              <div className="flex gap-6">
                {/* Left Sidebar - All Modules */}
                <div className="w-80 flex-shrink-0">
                  <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 sticky top-6 h-[calc(100vh-120px)] flex flex-col">
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                      {/* Category Selector */}
                      <div className="mb-3">
                        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 block">
                          Category
                        </label>
                        <select
                          value={isCreatingCategory ? 'create-new' : (selectedCategoryId || '')}
                          onChange={(e) => {
                            if (e.target.value === 'create-new') {
                              setIsCreatingCategory(true);
                            } else {
                              handleCategoryChange(Number(e.target.value));
                            }
                          }}
                          className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        >
                          <option value="">Select a category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name} {cat.isDefault ? '★' : ''} ({cat.vehicleType})
                            </option>
                          ))}
                          <option value="create-new">+ Create New Category</option>
                        </select>
                      </div>

                      {/* Create Category Form */}
                      {isCreatingCategory && (
                        <div className="mb-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Category name"
                            className="w-full px-3 py-1.5 mb-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded text-sm"
                          />
                          <select
                            value={newCategoryVehicleType}
                            onChange={(e) => setNewCategoryVehicleType(e.target.value)}
                            className="w-full px-3 py-1.5 mb-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded text-sm"
                          >
                            <option value="MOTORCYCLE">Motorcycle</option>
                            <option value="CAR">Car</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={handleCreateCategory}
                              disabled={!newCategoryName.trim()}
                              className="flex-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Create
                            </button>
                            <button
                              onClick={() => {
                                setIsCreatingCategory(false);
                                setNewCategoryName('');
                                setNewCategoryVehicleType('MOTORCYCLE');
                              }}
                              className="flex-1 px-3 py-1.5 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded text-xs font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                          All Modules
                        </h3>
                        <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-md text-xs font-medium">
                          {availableModules.length}
                        </span>
                      </div>
                      {isEditMode && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                          Drag to activate →
                        </p>
                      )}
                    </div>
                    <SortableContext
                      items={availableModules.map(m => m.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <DroppableArea id="available-droppable">
                        <div className="p-3 space-y-2 overflow-y-auto flex-1">
                          {availableModules.map((module) => (
                            <ModuleListItem key={module.id} module={module} isEditMode={isEditMode} />
                          ))}
                          {availableModules.length === 0 && (
                            <div className="text-center py-8 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600">
                              All modules active
                            </div>
                          )}
                        </div>
                      </DroppableArea>
                    </SortableContext>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-px bg-gradient-to-b from-transparent via-neutral-200 dark:via-neutral-700 to-transparent"></div>

                {/* Right Main Content - Active Modules */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                        Active Modules
                      </h2>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {isEditMode ? 'Drag to reorder or remove modules' : 'These modules are visible to students'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-lg text-sm font-medium">
                        {activeModules.length} active
                      </span>
                      {!isEditMode ? (
                        <button 
                          onClick={handleEnterEditMode}
                          className="btn btn-primary btn-sm"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Order
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={handleCancelEdit}
                            className="btn btn-ghost btn-sm"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleSaveOrder}
                            disabled={!hasChanges}
                            className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <SortableContext
                    items={activeModules.map(m => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableArea id="active-droppable">
                      <div className="space-y-3 min-h-[400px]">
                        {activeModules.map((module, index) => (
                          <ActiveModuleItem key={module.id} module={module} index={index} isEditMode={isEditMode} />
                        ))}
                        {activeModules.length === 0 && (
                          <div className="text-center py-20 text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 h-full flex flex-col items-center justify-center min-h-[400px]">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full mb-4">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <p className="font-medium mb-1">No active modules</p>
                            <p className="text-xs">
                              {isEditMode ? 'Drag modules from the sidebar to activate them' : 'Click "Edit Order" to manage modules'}
                            </p>
                          </div>
                        )}
                      </div>
                    </DroppableArea>
                  </SortableContext>
                </div>
              </div>

              {/* Drag Overlay */}
              <DragOverlay>
                {activeId ? (
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-neutral-800 border-2 border-brand-500 rounded-lg shadow-xl">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate">
                        {allModules.find(m => m.id === activeId)?.title}
                      </h3>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
            </>
          ) : (
            // Edit Modules Tab
            <div className="flex gap-6">
              {/* Left Sidebar - Module List */}
              <div className="w-80 flex-shrink-0">
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 sticky top-6 h-[calc(100vh-120px)] flex flex-col">
                  <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                      All Modules
                    </h3>
                    <button
                      onClick={handleCreateNewModule}
                      className="w-full px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create New Module
                    </button>
                  </div>
                  
                  <div className="p-3 space-y-2 overflow-y-auto flex-1">
                    {allModules.map((module) => (
                      <button
                        key={module.id}
                        onClick={() => handleSelectModule(module.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                          selectedModuleId === module.id
                            ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500'
                            : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-md'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate">
                            {module.title}
                          </h3>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="w-px bg-gradient-to-b from-transparent via-neutral-200 dark:via-neutral-700 to-transparent"></div>

              {/* Main Content Area */}
              <div className="flex-1 min-w-0">
                {selectedModuleId === null ? (
                  // Empty State
                  <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full mb-4">
                      <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                      Select a module or create a new one
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm max-w-md mx-auto">
                      Choose a module from the sidebar to edit its content and slides, or create a brand new learning module.
                    </p>
                  </div>
                ) : (
                  // Module Editor
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                        {selectedModuleId === 'new' ? 'Create New Module' : isEditingModule ? 'Edit Module' : 'View Module'}
                      </h2>
                      <div className="flex items-center gap-2">
                        {/* Preview Button */}
                        {moduleForm.slides.length > 0 && (
                          <button
                            onClick={() => setIsPreviewOpen(true)}
                            className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                            title="Preview module"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview
                          </button>
                        )}
                        
                        {/* View Mode: Show Edit and Delete buttons */}
                        {!isEditingModule && selectedModuleId !== 'new' && (
                          <>
                            <button
                              onClick={handleEditModule}
                              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={handleDeleteModule}
                              disabled={isDeleting}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {isDeleting && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              )}
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                          </>
                        )}
                        
                        {/* Edit Mode: Show Cancel and Save buttons */}
                        {isEditingModule && (
                          <>
                            <button
                              onClick={handleCancelModuleEdit}
                              className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium text-sm transition-colors"
                            >
                              Cancel
                            </button>
                            {selectedModuleId !== 'new' && (
                              <button
                                onClick={handleDeleteModule}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {isDeleting && (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                                {isDeleting ? 'Deleting...' : 'Delete'}
                              </button>
                            )}
                            <button
                              onClick={handleSaveModule}
                              disabled={!moduleForm.title || moduleForm.slides.length === 0 || isSaving}
                              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {isSaving && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              )}
                              {isSaving ? 'Saving...' : 'Save'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Module Basic Info */}
                    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">
                        Basic Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Title */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Module Title *
                          </label>
                          {isEditingModule ? (
                            <input
                              type="text"
                              value={moduleForm.title}
                              onChange={(e) => handleModuleFormChange('title', e.target.value)}
                              placeholder="e.g., Road Safety Basics"
                              className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100">
                              {moduleForm.title || 'N/A'}
                            </p>
                          )}
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Description
                          </label>
                          {isEditingModule ? (
                            <textarea
                              value={moduleForm.description}
                              onChange={(e) => handleModuleFormChange('description', e.target.value)}
                              placeholder="Brief description of what students will learn..."
                              rows={3}
                              className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                            />
                          ) : (
                            <p className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 min-h-[88px] whitespace-pre-wrap">
                              {moduleForm.description || 'No description provided'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Learning Objectives */}
                    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                          Learning Objectives
                        </h3>
                        {isEditingModule && (
                          <button
                            onClick={handleAddObjective}
                            className="px-3 py-1.5 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg font-medium text-sm transition-colors flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Objective
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {isEditingModule ? (
                          // Edit mode: Show input fields
                          moduleForm.objectives.map((objective, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={objective}
                                onChange={(e) => handleObjectiveChange(index, e.target.value)}
                                placeholder={`Objective ${index + 1}`}
                                className="flex-1 px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                              />
                              {moduleForm.objectives.length > 1 && (
                                <button
                                  onClick={() => handleRemoveObjective(index)}
                                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))
                        ) : (
                          // View mode: Show as list
                          <ul className="list-disc list-inside space-y-1.5">
                            {moduleForm.objectives.map((objective, index) => (
                              <li key={index} className="text-neutral-900 dark:text-neutral-100">
                                {objective || `Objective ${index + 1}`}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Slides Section */}
                    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                          Slides ({moduleForm.slides.length})
                        </h3>
                        {isEditingModule && (
                          <button
                            onClick={handleAddSlide}
                            disabled={editingSlideIndex !== null}
                            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Slide
                          </button>
                        )}
                      </div>

                      {/* Slide List */}
                      {moduleForm.slides.length > 0 && editingSlideIndex === null && (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragStart={handleSlideDragStart}
                          onDragEnd={handleSlideDragEnd}
                        >
                          <SortableContext
                            items={moduleForm.slides.map((_, index) => `slide-${index}`)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-2 mb-4">
                              {moduleForm.slides.map((slide, index) => (
                                <SortableSlideItem
                                  key={`slide-${index}`}
                                  slide={slide}
                                  index={index}
                                  isEditingModule={isEditingModule}
                                  onEdit={handleEditSlide}
                                  onDelete={handleDeleteSlide}
                                />
                              ))}
                            </div>
                          </SortableContext>
                          
                          {/* Drag Overlay for Slides */}
                          <DragOverlay>
                            {activeSlideId !== null ? (
                              <div className="flex items-center gap-3 p-3 bg-brand-50 dark:bg-brand-900/30 border-2 border-brand-500 rounded-lg shadow-2xl opacity-90">
                                <div className="p-1.5 bg-brand-100 dark:bg-brand-900/50 rounded">
                                  <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                  </svg>
                                </div>
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold text-sm">
                                  {parseInt(activeSlideId.replace('slide-', '')) + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate">
                                    {moduleForm.slides[parseInt(activeSlideId.replace('slide-', ''))]?.title || 'Untitled Slide'}
                                  </h4>
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                                    {moduleForm.slides[parseInt(activeSlideId.replace('slide-', ''))]?.type}
                                  </p>
                                </div>
                              </div>
                            ) : null}
                          </DragOverlay>
                        </DndContext>
                      )}

                      {/* Slide Editor */}
                      {editingSlideIndex !== null && (
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border-2 border-brand-500 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                              {editingSlideIndex === moduleForm.slides.length ? 'New Slide' : `Edit Slide ${editingSlideIndex + 1}`}
                            </h4>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleCancelSlideEdit}
                                className="px-3 py-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg font-medium text-sm transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveSlide}
                                disabled={!slideForm.title || !slideForm.content}
                                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Save Slide
                              </button>
                            </div>
                          </div>

                          {/* Slide Type */}
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Slide Type *
                            </label>
                            <select
                              value={slideForm.type}
                              onChange={(e) => handleSlideFormChange('type', e.target.value)}
                              className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            >
                              <option value="text">Text</option>
                              <option value="image">Image</option>
                              <option value="video">Video</option>
                            </select>
                          </div>

                          {/* Skill Level */}
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Skill Level *
                            </label>
                            <select
                              value={slideForm.skillLevel}
                              onChange={(e) => handleSlideFormChange('skillLevel', e.target.value)}
                              className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Expert">Expert</option>
                            </select>
                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                              Select the difficulty level for this slide
                            </p>
                          </div>

                          {/* Title */}
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Slide Title *
                            </label>
                            <input
                              type="text"
                              value={slideForm.title}
                              onChange={(e) => handleSlideFormChange('title', e.target.value)}
                              placeholder="e.g., Welcome to the Course"
                              className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            />
                          </div>

                          {/* Content */}
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Content *
                            </label>
                            {slideForm.type === 'text' ? (
                              <textarea
                                value={slideForm.content}
                                onChange={(e) => handleSlideFormChange('content', e.target.value)}
                                placeholder="Enter your slide content here..."
                                rows={6}
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                              />
                            ) : (
                              <FileUpload
                                type={slideForm.type}
                                file={slideForm.file}
                                onChange={(file) => {
                                  handleSlideFormChange('file', file);
                                  handleSlideFormChange('content', file.name);
                                }}
                                onRemove={() => {
                                  handleSlideFormChange('file', null);
                                  handleSlideFormChange('content', '');
                                }}
                              />
                            )}
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Description (for sidebar preview)
                            </label>
                            <input
                              type="text"
                              value={slideForm.description}
                              onChange={(e) => handleSlideFormChange('description', e.target.value)}
                              placeholder="Brief description of this slide"
                              className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      )}

                      {/* Empty State */}
                      {moduleForm.slides.length === 0 && editingSlideIndex === null && (
                        <div className="text-center py-8 text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="font-medium mb-1">No slides yet</p>
                          <p className="text-xs">Click "Add Slide" to create your first slide</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Preview Modal */}
      <LessonModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        lesson={{
          moduleId: selectedModuleId,
          title: moduleForm.title,
          description: moduleForm.description,
          objectives: moduleForm.objectives.filter(obj => obj.trim() !== ''),
          slides: moduleForm.slides.map(slide => {
            
            // Convert slide data for preview
            if (slide.type === 'video') {
              // If slide has an ID, use the API endpoint. Otherwise use the file preview
              const videoUrl = slide.id 
                ? moduleService.getSlideVideoUrl(slide.id)
                : slide.file ? URL.createObjectURL(slide.file) : '';
              return { ...slide, content: videoUrl };
            } else if (slide.type === 'image') {
              // If slide has an ID, use the API endpoint. Otherwise use the file preview
              const imageUrl = slide.id
                ? moduleService.getSlideImageUrl(slide.id)
                : slide.file ? URL.createObjectURL(slide.file) : '';
              return { ...slide, content: imageUrl };
            }
            return slide;
          }),
        }}
      />
    </div>
  );
}
