import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Eye, Plus, X, ChevronDown, ChevronUp, Image, Video, FileText, Upload, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useModules, useToast } from '../../shared';
import { LoadingSpinner, NavigationHeader } from '../../shared';
import { uploadSlideImage, uploadSlideVideo } from '../../../../services/moduleService';

export default function ModuleEditor() {
  const navigate = useNavigate();
  const { moduleId } = useParams(); // 'new' or actual ID
  const { fetchModuleById, createModule, updateModule, deleteModule } = useModules();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(null); // Track which slide is uploading
  const [isEditMode, setIsEditMode] = useState(false); // View vs Edit mode
  const [currentSlidePreview, setCurrentSlidePreview] = useState(0); // For preview navigation
  const [imageLoading, setImageLoading] = useState({}); // Track image loading state
  const [videoLoading, setVideoLoading] = useState({}); // Track video loading state
  
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    objectives: [''],
    isActive: false,
    slides: []
  });

  const [expandedSlide, setExpandedSlide] = useState(null);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(null);

  const isNewModule = moduleId === 'new';

  // Auto-enter edit mode for new modules
  useEffect(() => {
    setIsEditMode(isNewModule);
  }, [isNewModule]);

  // Load existing module data
  useEffect(() => {
    if (!isNewModule && moduleId && moduleId !== 'new') {
      loadModule();
    }
  }, [moduleId]);

  const loadModule = async () => {
    if (!moduleId || moduleId === 'new') {
      console.warn('Cannot load module: invalid moduleId', moduleId);
      return;
    }
    
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
        isActive: module.isActive || false,
        slides: module.slides && module.slides.length > 0
          ? module.slides.map(slide => ({
              id: slide.id,
              type: slide.type || 'text',
              title: slide.title || '',
              content: slide.content || '',
              description: slide.description || '',
              skillLevel: slide.skillLevel || 'Beginner',
              imageUrl: slide.imageUrl || '',
              videoUrl: slide.videoUrl || '',
              position: slide.position || 0
            }))
          : []
      });
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to load module' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const uploadPendingFiles = async (savedModule) => {
    // Upload any pending image/video files for slides that now have IDs
    for (let i = 0; i < savedModule.slides.length; i++) {
      const slide = savedModule.slides[i];
      const originalSlide = moduleForm.slides[i];
      
      if (originalSlide?.imageFile && slide.id) {
        try {
          await uploadSlideImage(slide.id, originalSlide.imageFile);
        } catch (error) {
          console.error(`Failed to upload image for slide ${i + 1}:`, error);
        }
      }
      
      if (originalSlide?.videoFile && slide.id) {
        try {
          await uploadSlideVideo(slide.id, originalSlide.videoFile);
        } catch (error) {
          console.error(`Failed to upload video for slide ${i + 1}:`, error);
        }
      }
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
        })),
        slides: moduleForm.slides.map((slide, index) => ({
          id: slide.id,
          type: slide.type,
          title: slide.title,
          content: slide.content,
          description: slide.description || '',
          skillLevel: slide.skillLevel,
          // Don't send blob URLs - they're just temporary previews
          imageUrl: slide.imageUrl && !slide.imageUrl.startsWith('blob:') ? slide.imageUrl : null,
          videoUrl: slide.videoUrl && !slide.videoUrl.startsWith('blob:') ? slide.videoUrl : null,
          position: index + 1
        }))
      };

      if (isNewModule) {
        const response = await createModule(moduleData);
        const newModuleId = response?.data?.id || response?.id;
        
        if (!newModuleId) {
          console.error('No module ID in response:', response);
          showToast({ type: 'error', message: 'Module created but ID not found' });
          return;
        }
        
        // Upload any pending files
        if (response?.data) {
          await uploadPendingFiles(response.data);
        }
        
        showToast({ type: 'success', message: 'Module created successfully' });
        navigate(`/admin/modules/${newModuleId}/edit`);
      } else {
        const response = await updateModule(moduleId, moduleData);
        
        // Upload any pending files
        if (response?.data) {
          await uploadPendingFiles(response.data);
        }
        
        showToast({ type: 'success', message: 'Module updated successfully' });
        await loadModule(); // Reload to get updated slide IDs
        setIsEditMode(false); // Switch to view mode after save
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

  const handleAddSlide = () => {
    const newSlide = {
      type: 'text',
      title: '',
      content: '',
      description: '',
      skillLevel: 'Beginner',
      imageUrl: '',
      videoUrl: '',
      imageFile: null,
      videoFile: null,
      position: moduleForm.slides.length + 1
    };
    setModuleForm(prev => ({ ...prev, slides: [...prev.slides, newSlide] }));
    setSelectedSlideIndex(moduleForm.slides.length);
  };

  const handleRemoveSlide = (index) => {
    setModuleForm(prev => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index)
    }));
    if (selectedSlideIndex === index) {
      setSelectedSlideIndex(index > 0 ? index - 1 : null);
    } else if (selectedSlideIndex > index) {
      setSelectedSlideIndex(selectedSlideIndex - 1);
    }
  };

  const handleSlideChange = (index, field, value) => {
    setModuleForm(prev => ({
      ...prev,
      slides: prev.slides.map((slide, i) => 
        i === index ? { ...slide, [field]: value } : slide
      )
    }));
  };

  const moveSlide = (index, direction) => {
    const newSlides = [...moduleForm.slides];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newSlides.length) return;
    
    [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
    setModuleForm(prev => ({ ...prev, slides: newSlides }));
    
    if (selectedSlideIndex === index) {
      setSelectedSlideIndex(newIndex);
    } else if (selectedSlideIndex === newIndex) {
      setSelectedSlideIndex(index);
    }
  };

  const getSlideIcon = (type) => {
    switch(type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleImageUpload = async (slideIndex, file) => {
    const slide = moduleForm.slides[slideIndex];
    
    // If slide has an ID, upload immediately
    if (slide.id) {
      try {
        setUploadingFile(`image-${slideIndex}`);
        const response = await uploadSlideImage(slide.id, file);
        
        // Update slide with the new image URL
        handleSlideChange(slideIndex, 'imageUrl', response.data.imageUrl);
        handleSlideChange(slideIndex, 'imageFile', null);
        showToast({ type: 'success', message: 'Image uploaded successfully' });
      } catch (error) {
        console.error('Image upload error:', error);
        showToast({ type: 'error', message: error.message || 'Failed to upload image' });
      } finally {
        setUploadingFile(null);
      }
    } else {
      // Store file temporarily for upload after save
      const previewUrl = URL.createObjectURL(file);
      handleSlideChange(slideIndex, 'imageFile', file);
      handleSlideChange(slideIndex, 'imageUrl', previewUrl);
      showToast({ type: 'info', message: 'Image selected. Save the module to upload.' });
    }
  };

  const handleVideoUpload = async (slideIndex, file) => {
    const slide = moduleForm.slides[slideIndex];
    
    // If slide has an ID, upload immediately
    if (slide.id) {
      try {
        setUploadingFile(`video-${slideIndex}`);
        const response = await uploadSlideVideo(slide.id, file);
        
        // Update slide with the new video URL
        handleSlideChange(slideIndex, 'videoUrl', response.data.videoUrl);
        handleSlideChange(slideIndex, 'videoFile', null);
        showToast({ type: 'success', message: 'Video uploaded successfully' });
      } catch (error) {
        console.error('Video upload error:', error);
        showToast({ type: 'error', message: error.message || 'Failed to upload video' });
      } finally {
        setUploadingFile(null);
      }
    } else {
      // Store file temporarily for upload after save
      const previewUrl = URL.createObjectURL(file);
      handleSlideChange(slideIndex, 'videoFile', file);
      handleSlideChange(slideIndex, 'videoUrl', previewUrl);
      showToast({ type: 'info', message: 'Video selected. Save the module to upload.' });
    }
  };

  const handleNextSlide = () => {
    if (currentSlidePreview < moduleForm.slides.length - 1) {
      setCurrentSlidePreview(currentSlidePreview + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlidePreview > 0) {
      setCurrentSlidePreview(currentSlidePreview - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // PREVIEW MODE - Show slide viewer
  if (!isEditMode && !isNewModule) {
    const currentSlide = moduleForm.slides[currentSlidePreview];
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/modules')}
                className="p-2 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {moduleForm.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
                  Preview Mode
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsEditMode(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Module
            </button>
          </div>

          {/* Module Info Card */}
          <div className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-800 rounded-lg shadow border border-gray-200 dark:border-neutral-700 p-6 mb-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                moduleForm.isActive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-neutral-400'
              }`}>
                {moduleForm.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {moduleForm.description || 'No description available'}
            </p>
            <div className="border-t border-gray-200 dark:border-neutral-700 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Learning Objectives:
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {moduleForm.objectives.map((obj, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-neutral-400">
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Slide Viewer */}
          {moduleForm.slides.length > 0 ? (
            <div className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-800 rounded-lg shadow border border-gray-200 dark:border-neutral-700 overflow-hidden backdrop-blur-sm">
              {/* Slide Progress */}
              <div className="bg-gray-100 dark:bg-neutral-700 px-6 py-3 flex items-center justify-between border-b border-gray-200 dark:border-neutral-600">
                <div className="flex items-center gap-2">
                  {getSlideIcon(currentSlide.type)}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Slide {currentSlidePreview + 1} of {moduleForm.slides.length}
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded">
                    {currentSlide.skillLevel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevSlide}
                    disabled={currentSlidePreview === 0}
                    className="p-2 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextSlide}
                    disabled={currentSlidePreview === moduleForm.slides.length - 1}
                    className="p-2 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Slide Content */}
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentSlide.title}
                </h2>
                {currentSlide.description && (
                  <p className="text-sm text-gray-600 dark:text-neutral-400 mb-6">
                    {currentSlide.description}
                  </p>
                )}

                {/* Text Content */}
                {currentSlide.type === 'text' && (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {currentSlide.content}
                    </p>
                  </div>
                )}

                {/* Image Slide */}
                {currentSlide.type === 'image' && (
                  <div className="space-y-4">
                    {currentSlide.content && (
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {currentSlide.content}
                      </p>
                    )}
                    {currentSlide.imageUrl && (
                      <div className="relative">
                        {imageLoading[currentSlidePreview] && (
                          <div className="absolute inset-0 bg-gray-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
                        )}
                        <img 
                          src={currentSlide.imageUrl} 
                          alt={currentSlide.title}
                          className="w-full rounded-lg border border-gray-300 dark:border-neutral-600"
                          onLoadStart={() => setImageLoading(prev => ({ ...prev, [currentSlidePreview]: true }))}
                          onLoad={() => setImageLoading(prev => ({ ...prev, [currentSlidePreview]: false }))}
                          onError={() => setImageLoading(prev => ({ ...prev, [currentSlidePreview]: false }))}
                          style={{ display: imageLoading[currentSlidePreview] ? 'none' : 'block' }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Video Slide */}
                {currentSlide.type === 'video' && (
                  <div className="space-y-4">
                    {currentSlide.content && (
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">
                        {currentSlide.content}
                      </p>
                    )}
                    {currentSlide.videoUrl && (
                      <div className="relative">
                        {videoLoading[currentSlidePreview] && (
                          <div className="absolute inset-0 bg-gray-200 dark:bg-neutral-700 rounded-lg animate-pulse flex items-center justify-center">
                            <LoadingSpinner size="lg" />
                          </div>
                        )}
                        <video 
                          src={currentSlide.videoUrl} 
                          controls
                          className="w-full rounded-lg border border-gray-300 dark:border-neutral-600"
                          onLoadStart={() => setVideoLoading(prev => ({ ...prev, [currentSlidePreview]: true }))}
                          onLoadedData={() => setVideoLoading(prev => ({ ...prev, [currentSlidePreview]: false }))}
                          onError={() => setVideoLoading(prev => ({ ...prev, [currentSlidePreview]: false }))}
                          style={{ display: videoLoading[currentSlidePreview] ? 'none' : 'block' }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-gray-200 dark:border-neutral-700 p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-neutral-400 mb-2">
                No slides in this module
              </p>
              <button
                onClick={() => setIsEditMode(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Add slides in edit mode
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // EDIT MODE - Show editor interface
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/modules')}
              className="p-2 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isNewModule ? 'Create New Module' : 'Edit Module'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
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
        <div className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-800 rounded-lg shadow border border-gray-200 dark:border-neutral-700 p-6 mb-6 backdrop-blur-sm">
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
                className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={moduleForm.isActive}
                onChange={(e) => setModuleForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Module is active (visible to students)
              </label>
            </div>
          </div>
        </div>

        {/* Learning Objectives Card */}
        <div className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-800 rounded-lg shadow border border-gray-200 dark:border-neutral-700 p-6 mb-6 backdrop-blur-sm">
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
                <div className="flex-shrink-0 w-8 h-9 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-neutral-400">
                  {index + 1}.
                </div>
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => handleObjectiveChange(index, e.target.value)}
                  placeholder={`Objective ${index + 1}`}
                  className="flex-1 px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Slides Section */}
        <div className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-800 rounded-lg shadow border border-gray-200 dark:border-neutral-700 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Slides ({moduleForm.slides.length})
            </h2>
            <button
              onClick={handleAddSlide}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Slide
            </button>
          </div>

          {moduleForm.slides.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-neutral-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-neutral-600">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-neutral-400 mb-2">
                No slides yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Click "Add Slide" to create your first slide
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Slide Selector */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Select Slide:
                </label>
                <select
                  value={selectedSlideIndex === null ? '' : selectedSlideIndex}
                  onChange={(e) => setSelectedSlideIndex(e.target.value === '' ? null : parseInt(e.target.value))}
                  className="flex-1 px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select a slide to edit --</option>
                  {moduleForm.slides.map((slide, index) => (
                    <option key={index} value={index}>
                      Slide {index + 1}: {slide.title || 'Untitled'} ({slide.type} - {slide.skillLevel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Slide Editor */}
              {selectedSlideIndex !== null && (
                <div className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {getSlideIcon(moduleForm.slides[selectedSlideIndex].type)}
                      Slide #{selectedSlideIndex + 1}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveSlide(selectedSlideIndex, 'up')}
                        disabled={selectedSlideIndex === 0}
                        className="p-2 text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveSlide(selectedSlideIndex, 'down')}
                        disabled={selectedSlideIndex === moduleForm.slides.length - 1}
                        className="p-2 text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveSlide(selectedSlideIndex)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Delete slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Slide Type *
                        </label>
                        <select
                          value={moduleForm.slides[selectedSlideIndex].type}
                          onChange={(e) => handleSlideChange(selectedSlideIndex, 'type', e.target.value)}
                          className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="text">Text</option>
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Skill Level *
                        </label>
                        <select
                          value={moduleForm.slides[selectedSlideIndex].skillLevel}
                          onChange={(e) => handleSlideChange(selectedSlideIndex, 'skillLevel', e.target.value)}
                          className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Slide Title *
                      </label>
                      <input
                        type="text"
                        value={moduleForm.slides[selectedSlideIndex].title}
                        onChange={(e) => handleSlideChange(selectedSlideIndex, 'title', e.target.value)}
                        placeholder="Enter slide title"
                        className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={moduleForm.slides[selectedSlideIndex].description}
                        onChange={(e) => handleSlideChange(selectedSlideIndex, 'description', e.target.value)}
                        placeholder="Brief description (optional)"
                        className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content *
                      </label>
                      <textarea
                        value={moduleForm.slides[selectedSlideIndex].content}
                        onChange={(e) => handleSlideChange(selectedSlideIndex, 'content', e.target.value)}
                        placeholder="Enter slide content..."
                        rows={8}
                        className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    {moduleForm.slides[selectedSlideIndex].type === 'image' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Slide Image
                        </label>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              accept="image/*"
                              id={`image-upload-${selectedSlideIndex}`}
                              className="hidden"
                              disabled={uploadingFile === `image-${selectedSlideIndex}`}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleImageUpload(selectedSlideIndex, file);
                              }}
                            />
                            <label
                              htmlFor={`image-upload-${selectedSlideIndex}`}
                              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                                uploadingFile === `image-${selectedSlideIndex}`
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {uploadingFile === `image-${selectedSlideIndex}` ? (
                                <>
                                  <LoadingSpinner size="sm" className="mr-2" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Choose Image File
                                </>
                              )}
                            </label>
                            
                            {moduleForm.slides[selectedSlideIndex].imageUrl && (
                              <span className="text-sm text-green-600 dark:text-green-400">
                                ✓ Image uploaded
                              </span>
                            )}
                          </div>

                          {moduleForm.slides[selectedSlideIndex].imageUrl && (
                            <div className="mt-3 relative">
                              {imageLoading[`edit-${selectedSlideIndex}`] && (
                                <div className="absolute inset-0 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" style={{ maxHeight: '16rem' }} />
                              )}
                              <img 
                                src={moduleForm.slides[selectedSlideIndex].imageUrl} 
                                alt="Preview" 
                                className="max-w-full max-h-64 rounded border border-gray-300 dark:border-neutral-600"
                                onLoadStart={() => setImageLoading(prev => ({ ...prev, [`edit-${selectedSlideIndex}`]: true }))}
                                onLoad={() => setImageLoading(prev => ({ ...prev, [`edit-${selectedSlideIndex}`]: false }))}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  setImageLoading(prev => ({ ...prev, [`edit-${selectedSlideIndex}`]: false }));
                                }}
                                style={{ display: imageLoading[`edit-${selectedSlideIndex}`] ? 'none' : 'block' }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {moduleForm.slides[selectedSlideIndex].type === 'video' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Slide Video
                        </label>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              accept="video/*"
                              id={`video-upload-${selectedSlideIndex}`}
                              className="hidden"
                              disabled={uploadingFile === `video-${selectedSlideIndex}`}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleVideoUpload(selectedSlideIndex, file);
                              }}
                            />
                            <label
                              htmlFor={`video-upload-${selectedSlideIndex}`}
                              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                                uploadingFile === `video-${selectedSlideIndex}`
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {uploadingFile === `video-${selectedSlideIndex}` ? (
                                <>
                                  <LoadingSpinner size="sm" className="mr-2" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Choose Video File
                                </>
                              )}
                            </label>
                            
                            {moduleForm.slides[selectedSlideIndex].videoUrl && (
                              <span className="text-sm text-green-600 dark:text-green-400">
                                ✓ Video uploaded
                              </span>
                            )}
                          </div>

                          {moduleForm.slides[selectedSlideIndex].videoUrl && (
                            <div className="mt-3 relative">
                              {videoLoading[`edit-${selectedSlideIndex}`] && (
                                <div className="absolute inset-0 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse flex items-center justify-center" style={{ maxHeight: '16rem' }}>
                                  <LoadingSpinner size="lg" />
                                </div>
                              )}
                              <video 
                                src={moduleForm.slides[selectedSlideIndex].videoUrl} 
                                controls
                                className="max-w-full max-h-64 rounded border border-gray-300 dark:border-neutral-600"
                                onLoadStart={() => setVideoLoading(prev => ({ ...prev, [`edit-${selectedSlideIndex}`]: true }))}
                                onLoadedData={() => setVideoLoading(prev => ({ ...prev, [`edit-${selectedSlideIndex}`]: false }))}
                                onError={() => setVideoLoading(prev => ({ ...prev, [`edit-${selectedSlideIndex}`]: false }))}
                                style={{ display: videoLoading[`edit-${selectedSlideIndex}`] ? 'none' : 'block' }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

