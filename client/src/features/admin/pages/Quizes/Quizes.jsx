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
} from '@dnd-kit/sortable';
import QuizModal from '../../../../components/QuizModal';
import { ModuleListItem, SortableQuestionItem, QuestionTypeSelector, FileUpload, QuizAnalytics } from './components';
import * as quizService from '../../../../services/quizService';
import * as moduleService from '../../../../services/moduleService';

export default function Quizes() {
  const [activeTab, setActiveTab] = useState('quizzes');
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    instructions: '',
    passingScore: 70,
    timeLimit: null,
    shuffleQuestions: false,
    showResults: true,
    questions: []
  });
  
  // Question editor state
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [pendingMediaUploads, setPendingMediaUploads] = useState([]); // Track media to upload after save
  const [showMediaSection, setShowMediaSection] = useState(false); // Toggle media upload section
  const [questionForm, setQuestionForm] = useState({
    type: 'MULTIPLE_CHOICE',
    question: '',
    description: '',
    points: 1,
    caseSensitive: false,
    shuffleOptions: false,
    videoFile: null,
    imageFile: null,
    hasExistingVideo: false,
    hasExistingImage: false,
    options: [
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false }
    ]
  });
  
  // Preview modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Statistics
  const [statistics, setStatistics] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadModules();
  }, []);

  useEffect(() => {
    if (selectedQuiz && activeTab === 'statistics') {
      loadStatistics();
    }
  }, [selectedQuiz, activeTab]);

  // Debug: Log quizForm state changes
  useEffect(() => {
    if (quizForm.questions.length > 0) {
      console.log('🔄 quizForm updated:', {
        questionsCount: quizForm.questions.length,
        firstQuestion: quizForm.questions[0],
        firstQuestionOptions: quizForm.questions[0]?.options
      });
    }
  }, [quizForm]);

  async function loadModules() {
    try {
      setLoading(true);
      setError(null);
      const response = await moduleService.getAllModules({ includeObjectives: true });
      
      // Load quizzes for each module
      const modulesWithQuizzes = await Promise.all(
        response.data.map(async (module) => {
          try {
            const quizzesResponse = await quizService.getAllQuizzes({ moduleId: module.id });
            return {
              ...module,
              quizzes: quizzesResponse.data || []
            };
          } catch (err) {
            console.error(`Failed to load quizzes for module ${module.id}:`, err);
            return {
              ...module,
              quizzes: []
            };
          }
        })
      );
      
      setModules(modulesWithQuizzes);
      
      // Auto-select first module if none selected
      if (!selectedModuleId && modulesWithQuizzes.length > 0) {
        handleSelectModule(modulesWithQuizzes[0].id);
      }
    } catch (err) {
      console.error('Failed to load modules:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectModule(moduleId) {
    setSelectedModuleId(moduleId);
    setIsEditing(false);
    setEditingQuestionIndex(null);
    
    const module = modules.find(m => m.id === moduleId);
    
    if (module?.quizzes && module.quizzes.length > 0) {
      // Load quiz details
      try {
        const response = await quizService.getQuizById(module.quizzes[0].id, {
          includeCorrectAnswers: true
        });
        
        console.log('📚 Loaded quiz from backend:', response.data);
        console.log('📝 Questions:', response.data.questions);
        response.data.questions?.forEach((q, i) => {
          console.log(`Question ${i + 1}:`, q.question);
          console.log(`  Options:`, q.options);
        });
        
        setSelectedQuiz(response.data);
        setQuizForm({
          title: response.data.title,
          description: response.data.description || '',
          instructions: response.data.instructions || '',
          passingScore: response.data.passingScore || 70,
          timeLimit: response.data.timeLimit || null,
          shuffleQuestions: response.data.shuffleQuestions || false,
          showResults: response.data.showResults !== false,
          questions: response.data.questions || []
        });
      } catch (err) {
        console.error('Failed to load quiz:', err);
        alert('Failed to load quiz: ' + err.message);
      }
    } else {
      // No quiz for this module
      setSelectedQuiz(null);
      setQuizForm({
        title: `${module?.title} Quiz`,
        description: '',
        instructions: '',
        passingScore: 70,
        timeLimit: null,
        shuffleQuestions: false,
        showResults: true,
        questions: []
      });
    }
  }

  async function loadStatistics() {
    if (!selectedQuiz) return;
    
    try {
      const stats = await quizService.getQuizStatistics(selectedQuiz.id);
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  }

  function handleCreateQuiz() {
    const module = modules.find(m => m.id === selectedModuleId);
    setSelectedQuiz(null);
    setIsEditing(true);
    setQuizForm({
      title: `${module?.title} Quiz`,
      description: '',
      instructions: '',
      passingScore: 70,
      timeLimit: null,
      shuffleQuestions: false,
      showResults: true,
      questions: []
    });
  }

  function handleEditQuiz() {
    setIsEditing(true);
  }

  function handleCancelEdit() {
    if (editingQuestionIndex !== null) {
      if (!confirm('You have unsaved changes to a question. Discard changes?')) {
        return;
      }
    }
    
    if (selectedQuiz) {
      // Reload quiz data
      handleSelectModule(selectedModuleId);
    } else {
      setSelectedQuiz(null);
      setQuizForm({
        title: '',
        description: '',
        instructions: '',
        passingScore: 70,
        timeLimit: null,
        shuffleQuestions: false,
        showResults: true,
        maxAttempts: null,
        allowReview: true,
        questions: []
      });
    }
    setIsEditing(false);
    setEditingQuestionIndex(null);
  }

  async function handleSaveQuiz() {
    try {
      setIsSaving(true);
      
      // Validate minimum question count
      if (quizForm.questions.length < 10) {
        alert(`Each quiz must have at least 10 questions. Currently: ${quizForm.questions.length}/10 questions.`);
        setIsSaving(false);
        return;
      }
      
      const quizData = {
        moduleId: selectedModuleId,
        title: quizForm.title,
        description: quizForm.description,
        instructions: quizForm.instructions,
        passingScore: quizForm.passingScore,
        timeLimit: quizForm.timeLimit,
        shuffleQuestions: quizForm.shuffleQuestions,
        showResults: quizForm.showResults,
        questions: quizForm.questions.map((q, index) => {
          const questionData = {
            type: q.type,
            question: q.question,
            description: q.description,
            points: q.points,
            position: index + 1,
            caseSensitive: q.caseSensitive,
            shuffleOptions: q.shuffleOptions,
            options: q.options?.map((opt, optIndex) => ({
              optionText: opt.optionText,
              isCorrect: opt.isCorrect,
              position: optIndex + 1
            })) || []
          };
          
          // Preserve existing media references if present
          if (q.id) {
            questionData.id = q.id;
          }
          // Keep videoPath if it exists (don't remove it on edit)
          if (q.videoPath) {
            questionData.videoPath = q.videoPath;
          }
          // Keep imageMime and imageData if they exist
          if (q.imageMime) {
            questionData.imageMime = q.imageMime;
          }
          if (q.imageData) {
            questionData.imageData = q.imageData;
          }
          
          return questionData;
        })
      };

      console.log('💾 Saving quiz data:', quizData);
      console.log('📝 Questions being saved:', quizData.questions);
      quizData.questions?.forEach((q, i) => {
        console.log(`Question ${i + 1} options:`, q.options);
      });

      let savedQuiz;
      if (selectedQuiz) {
        // Update existing quiz
        savedQuiz = await quizService.updateQuiz(selectedQuiz.id, quizData);
        console.log('✅ Quiz update response:', savedQuiz);
      } else {
        // Create new quiz
        savedQuiz = await quizService.createQuiz(quizData);
        console.log('✅ Quiz create response:', savedQuiz);
      }

      // Upload pending media files
      if (pendingMediaUploads.length > 0 && savedQuiz?.questions) {
        console.log('📤 Uploading media for', pendingMediaUploads.length, 'questions...');
        
        for (const upload of pendingMediaUploads) {
          const question = savedQuiz.questions[upload.questionIndex];
          if (question?.id) {
            try {
              await uploadQuestionMedia(question.id, upload.videoFile, upload.imageFile);
              console.log(`✅ Media uploaded for question ${upload.questionIndex + 1}`);
            } catch (error) {
              console.error(`Failed to upload media for question ${upload.questionIndex + 1}:`, error);
              alert(`Warning: Failed to upload media for question ${upload.questionIndex + 1}`);
            }
          }
        }
        
        // Clear pending uploads
        setPendingMediaUploads([]);
        console.log('✅ All media uploads completed');
      }

      alert(selectedQuiz ? 'Quiz updated successfully!' : 'Quiz created successfully!');

      // Reload modules and select current module
      await loadModules();
      setTimeout(() => handleSelectModule(selectedModuleId), 500);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save quiz:', err);
      alert('Failed to save quiz: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteQuiz() {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await quizService.deleteQuiz(selectedQuiz.id);
      alert('Quiz deleted successfully!');
      
      await loadModules();
      handleSelectModule(selectedModuleId);
    } catch (err) {
      console.error('Failed to delete quiz:', err);
      alert('Failed to delete quiz: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  }

  function handleQuizFormChange(field, value) {
    setQuizForm(prev => ({ ...prev, [field]: value }));
  }

  function handleAddQuestion() {
    setEditingQuestionIndex(quizForm.questions.length);
    setQuestionForm({
      type: 'MULTIPLE_CHOICE',
      question: '',
      description: '',
      points: 1,
      caseSensitive: false,
      shuffleOptions: false,
      videoFile: null,
      imageFile: null,
      hasExistingVideo: false,
      hasExistingImage: false,
      options: [
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false }
      ]
    });
  }

  function handleEditQuestion(index) {
    setEditingQuestionIndex(index);
    const question = quizForm.questions[index];
    
    console.log('✏️ ====== EDITING QUESTION ======');
    console.log('Question index:', index);
    console.log('Question object:', question);
    console.log('Question text:', question.question);
    console.log('Question type:', question.type);
    console.log('Raw options:', question.options);
    console.log('Options with isCorrect details:');
    question.options?.forEach((opt, i) => {
      console.log(`  [${i}] "${opt.optionText}"`);
      console.log(`      isCorrect: ${opt.isCorrect}`);
      console.log(`      type: ${typeof opt.isCorrect}`);
      console.log(`      === true: ${opt.isCorrect === true}`);
      console.log(`      truthy: ${!!opt.isCorrect}`);
    });
    
    let mappedOptions;
    
    // For IDENTIFICATION/FILL_BLANK, ensure we have at least one option
    if (['IDENTIFICATION', 'FILL_BLANK'].includes(question.type)) {
      const correctOption = question.options?.find(opt => opt.isCorrect === true);
      mappedOptions = [{
        optionText: correctOption?.optionText || '',
        isCorrect: true,
        position: 1
      }];
    } else {
      // For other types, map all options
      mappedOptions = question.options?.map(opt => ({
        optionText: opt.optionText,
        isCorrect: opt.isCorrect === true // Ensure boolean
      })) || [
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false }
      ];
    }
    
    console.log('Mapped options for questionForm:', mappedOptions);
    
    setQuestionForm({
      type: question.type,
      question: question.question,
      description: question.description || '',
      points: question.points,
      caseSensitive: question.caseSensitive || false,
      shuffleOptions: question.shuffleOptions || false,
      videoFile: null,
      imageFile: null,
      hasExistingVideo: !!question.videoPath,
      hasExistingImage: !!question.hasImage || !!question.imageMime,
      questionId: question.id, // Store the question ID for media uploads
      options: mappedOptions
    });
    
    console.log('✏️ ====== END EDITING QUESTION ======');
  }

  function handleQuestionFormChange(field, value) {
    // Log media file changes
    if (field === 'videoFile' || field === 'imageFile') {
      console.log(`📎 Media file ${field} changed:`, value?.name || 'removed');
      
      // Only allow one media type at a time
      if (value) {
        if (field === 'videoFile') {
          // Clear image when video is uploaded
          setQuestionForm(prev => ({ 
            ...prev, 
            videoFile: value,
            imageFile: null,
            hasExistingImage: false
          }));
          return;
        } else if (field === 'imageFile') {
          // Clear video when image is uploaded
          setQuestionForm(prev => ({ 
            ...prev, 
            imageFile: value,
            videoFile: null,
            hasExistingVideo: false
          }));
          return;
        }
      }
    }
    
    if (field === 'type') {
      // When changing question type, reset options appropriately
      let newOptions = [];
      
      if (value === 'TRUE_FALSE') {
        newOptions = [
          { optionText: 'True', isCorrect: false },
          { optionText: 'False', isCorrect: false }
        ];
      } else if (value === 'IDENTIFICATION' || value === 'FILL_BLANK') {
        // Single correct answer option
        newOptions = [
          { optionText: '', isCorrect: true, position: 1 }
        ];
      } else {
        // Multiple choice or multiple answer
        newOptions = [
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false }
        ];
      }
      
      setQuestionForm(prev => ({ ...prev, type: value, options: newOptions }));
    } else {
      setQuestionForm(prev => ({ ...prev, [field]: value }));
    }
  }

  function handleAddOption() {
    setQuestionForm(prev => ({
      ...prev,
      options: [...prev.options, { optionText: '', isCorrect: false }]
    }));
  }

  function handleRemoveOption(index) {
    if (questionForm.options.length <= 2) {
      alert('A question must have at least 2 options');
      return;
    }
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  }

  function handleOptionChange(index, field, value) {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  }

  function handleSaveQuestion() {
    // Validation
    if (!questionForm.question.trim()) {
      alert('Please enter a question');
      return;
    }

    // Validate based on question type
    if (['IDENTIFICATION', 'FILL_BLANK'].includes(questionForm.type)) {
      if (!questionForm.options[0]?.optionText?.trim()) {
        alert('Please enter the correct answer');
        return;
      }
    } else if (['MULTIPLE_CHOICE', 'TRUE_FALSE', 'MULTIPLE_ANSWER'].includes(questionForm.type)) {
      if (questionForm.options.some(opt => !opt.optionText.trim())) {
        alert('All options must have text');
        return;
      }
      if (!questionForm.options.some(opt => opt.isCorrect)) {
        alert('At least one option must be marked as correct');
        return;
      }
    }

    const newQuestions = [...quizForm.questions];
    const questionData = {
      ...questionForm,
      id: questionForm.questionId, // Use 'id' for backend, not 'questionId'
      questionId: undefined, // Remove questionId field
      videoFile: undefined, // Don't store file objects in questions array
      imageFile: undefined,
      hasExistingVideo: questionForm.hasExistingVideo,
      hasExistingImage: questionForm.hasExistingImage
    };
    
    if (editingQuestionIndex === quizForm.questions.length) {
      // Adding new
      newQuestions.push(questionData);
    } else {
      // Editing existing
      newQuestions[editingQuestionIndex] = questionData;
    }

    setQuizForm(prev => ({ ...prev, questions: newQuestions }));
    
    // Handle media uploads
    if (questionForm.videoFile || questionForm.imageFile) {
      const questionIndex = editingQuestionIndex === quizForm.questions.length 
        ? newQuestions.length - 1 
        : editingQuestionIndex;
      
      // If editing existing quiz and question has ID, upload immediately
      if (selectedQuiz && questionForm.questionId) {
        console.log('📤 Uploading media immediately for existing question:', questionForm.questionId);
        uploadQuestionMedia(questionForm.questionId, questionForm.videoFile, questionForm.imageFile)
          .then(() => {
            console.log('✅ Media uploaded successfully');
            // Reload quiz to show updated media flags
            handleSelectModule(selectedModuleId);
          })
          .catch(error => {
            console.error('Failed to upload media:', error);
            alert('Failed to upload media: ' + error.message);
          });
      } else {
        // For new quizzes, queue uploads for after save
        setPendingMediaUploads(prev => {
          const filtered = prev.filter(upload => upload.questionIndex !== questionIndex);
          return [...filtered, {
            questionIndex,
            videoFile: questionForm.videoFile,
            imageFile: questionForm.imageFile
          }];
        });
        console.log('📤 Media queued for upload at question index:', questionIndex);
      }
    }
    
    setEditingQuestionIndex(null);
    setQuestionForm({
      type: 'MULTIPLE_CHOICE',
      question: '',
      description: '',
      points: 1,
      caseSensitive: false,
      shuffleOptions: false,
      videoFile: null,
      imageFile: null,
      hasExistingVideo: false,
      hasExistingImage: false,
      options: [
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false }
      ]
    });
  }

  async function uploadQuestionMedia(questionId, videoFile, imageFile) {
    const token = localStorage.getItem('token');
    
    console.log('🎬 uploadQuestionMedia called:', {
      questionId,
      hasVideo: !!videoFile,
      hasImage: !!imageFile,
      videoName: videoFile?.name,
      imageName: imageFile?.name
    });
    
    try {
      // Upload video if provided
      if (videoFile) {
        console.log('📤 Uploading video file:', videoFile.name, videoFile.size, 'bytes');
        const formData = new FormData();
        formData.append('video', videoFile);
        
        const response = await fetch(`/api/quizzes/questions/${questionId}/upload-video`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',  // Include cookies for authentication
          body: formData
        });
        
        const responseData = await response.json();
        console.log('📹 Video upload response:', response.status, responseData);
        
        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to upload video');
        }
        console.log('✅ Video uploaded successfully');
      }
      
      // Upload image if provided
      if (imageFile) {
        console.log('📤 Uploading image file:', imageFile.name, imageFile.size, 'bytes');
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const response = await fetch(`/api/quizzes/questions/${questionId}/upload-image`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',  // Include cookies for authentication
          body: formData
        });
        
        const responseData = await response.json();
        console.log('🖼️ Image upload response:', response.status, responseData);
        
        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to upload image');
        }
        console.log('✅ Image uploaded successfully');
      }
    } catch (error) {
      console.error('❌ Error uploading media:', error);
      throw error;
    }
  }

  function handleCancelQuestionEdit() {
    setEditingQuestionIndex(null);
    setQuestionForm({
      type: 'MULTIPLE_CHOICE',
      question: '',
      description: '',
      points: 1,
      caseSensitive: false,
      shuffleOptions: false,
      videoFile: null,
      imageFile: null,
      hasExistingVideo: false,
      hasExistingImage: false,
      options: [
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false }
      ]
    });
  }

  function handleDeleteQuestion(index) {
    if (!confirm('Delete this question?')) return;
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  }

  function handleQuestionDragEnd(event) {
    const { active, over } = event;
    if (!over || !isEditing) return;
    if (active.id === over.id) return;

    const oldIndex = parseInt(active.id.replace('question-', ''));
    const newIndex = parseInt(over.id.replace('question-', ''));

    setQuizForm(prev => ({
      ...prev,
      questions: arrayMove(prev.questions, oldIndex, newIndex)
    }));
  }

  const selectedModule = modules.find(m => m.id === selectedModuleId);
  const hasQuiz = selectedQuiz !== null;

  return (
    <div className="p-6">
      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-neutral-200 dark:border-neutral-700 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading quizzes...</p>
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
              <h3 className="font-semibold text-red-900 dark:text-red-100">Failed to load quizzes</h3>
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
          {/* Tabs */}
          <div className="border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex gap-1 p-1">
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`flex-1 px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'quizzes'
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                Quizzes
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                disabled={!hasQuiz}
                className={`flex-1 px-6 py-3 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeTab === 'statistics'
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                Statistics
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'quizzes' ? (
              <div className="flex gap-6">
                {/* Left Sidebar - Module List */}
                <div className="w-80 flex-shrink-0">
                  <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 sticky top-6 h-[calc(100vh-120px)] flex flex-col">
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
                        Modules
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Select a module to manage its quiz
                      </p>
                    </div>
                    
                    <div className="p-3 space-y-2 overflow-y-auto flex-1">
                      {modules.map((module) => (
                        <ModuleListItem
                          key={module.id}
                          module={module}
                          isSelected={selectedModuleId === module.id}
                          onClick={() => handleSelectModule(module.id)}
                        />
                      ))}
                      
                      {modules.length === 0 && (
                        <div className="text-center py-8 text-xs text-neutral-500 dark:text-neutral-400">
                          No modules available
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-px bg-gradient-to-b from-transparent via-neutral-200 dark:via-neutral-700 to-transparent"></div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                  {!selectedModuleId ? (
                    // Empty State
                    <div className="text-center py-20">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full mb-4">
                        <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        Select a module
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm max-w-md mx-auto">
                        Choose a module from the sidebar to create or edit its quiz
                      </p>
                    </div>
                  ) : !hasQuiz && !isEditing ? (
                    // No Quiz State
                    <div className="text-center py-20">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full mb-4">
                        <svg className="w-8 h-8 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        No quiz for {selectedModule?.title}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm max-w-md mx-auto mb-6">
                        Create a quiz to assess learners' knowledge of this module
                      </p>
                      <button
                        onClick={handleCreateQuiz}
                        className="btn btn-primary"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Quiz
                      </button>
                    </div>
                  ) : (
                    // Quiz Editor/Viewer
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                            {selectedModule?.title}
                          </h2>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {isEditing ? (hasQuiz ? 'Edit Quiz' : 'Create New Quiz') : 'View Quiz'}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Preview Button */}
                          {quizForm.questions.length > 0 && (
                            <button
                              onClick={() => setIsPreviewOpen(true)}
                              className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Preview
                            </button>
                          )}
                          
                          {/* View Mode Buttons */}
                          {!isEditing && hasQuiz && (
                            <>
                              <button
                                onClick={handleEditQuiz}
                                className="btn btn-primary"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={handleDeleteQuiz}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                              >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                              </button>
                            </>
                          )}
                          
                          {/* Edit Mode Buttons */}
                          {isEditing && (
                            <>
                              <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg font-medium text-sm transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveQuiz}
                                disabled={!quizForm.title || quizForm.questions.length === 0 || quizForm.questions.length < 10 || isSaving}
                                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                title={quizForm.questions.length < 10 && quizForm.questions.length > 0 ? `Add ${10 - quizForm.questions.length} more question(s) to reach the minimum of 10 questions` : ''}
                              >
                                {isSaving ? 'Saving...' : 'Save Quiz'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Quiz Basic Info */}
                      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">
                          Basic Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Title */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Quiz Title *
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={quizForm.title}
                                onChange={(e) => handleQuizFormChange('title', e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg"
                              />
                            ) : (
                              <p className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg">
                                {quizForm.title}
                              </p>
                            )}
                          </div>

                          {/* Description */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Description
                            </label>
                            {isEditing ? (
                              <textarea
                                value={quizForm.description}
                                onChange={(e) => handleQuizFormChange('description', e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg resize-none"
                              />
                            ) : (
                              <p className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg min-h-[60px]">
                                {quizForm.description || 'No description'}
                              </p>
                            )}
                          </div>

                          {/* Instructions */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Instructions
                            </label>
                            {isEditing ? (
                              <textarea
                                value={quizForm.instructions}
                                onChange={(e) => handleQuizFormChange('instructions', e.target.value)}
                                rows={3}
                                placeholder="Enter instructions for students..."
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg resize-none"
                              />
                            ) : (
                              <p className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg min-h-[88px] whitespace-pre-wrap">
                                {quizForm.instructions || 'No instructions'}
                              </p>
                            )}
                          </div>

                          {/* Passing Score */}
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Passing Score (%)
                            </label>
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={quizForm.passingScore}
                                onChange={(e) => handleQuizFormChange('passingScore', parseInt(e.target.value))}
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg"
                              />
                            ) : (
                              <p className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg">
                                {quizForm.passingScore}%
                              </p>
                            )}
                          </div>

                          {/* Time Limit */}
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Time Limit (seconds)
                            </label>
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={quizForm.timeLimit || ''}
                                onChange={(e) => handleQuizFormChange('timeLimit', e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="No limit"
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg"
                              />
                            ) : (
                              <p className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg">
                                {quizForm.timeLimit ? `${quizForm.timeLimit}s` : 'No limit'}
                              </p>
                            )}
                          </div>

                          {/* Settings */}
                          <div className="md:col-span-2 space-y-3">
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={quizForm.shuffleQuestions}
                                onChange={(e) => handleQuizFormChange('shuffleQuestions', e.target.checked)}
                                disabled={!isEditing}
                                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
                              />
                              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                Shuffle questions
                              </span>
                            </label>
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={quizForm.showResults}
                                onChange={(e) => handleQuizFormChange('showResults', e.target.checked)}
                                disabled={!isEditing}
                                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
                              />
                              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                Show results after submission
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Questions Section */}
                      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                              Questions
                            </h3>
                            {isEditing && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                quizForm.questions.length >= 10 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                              }`}>
                                {quizForm.questions.length}/10 questions
                              </span>
                            )}
                          </div>
                          {isEditing && (
                            <button
                              onClick={handleAddQuestion}
                              disabled={editingQuestionIndex !== null}
                              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Add Question
                            </button>
                          )}
                        </div>

                        {/* Warning banner when below minimum questions */}
                        {isEditing && quizForm.questions.length > 0 && quizForm.questions.length < 10 && (
                          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                  Minimum questions required
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                  You need to add {10 - quizForm.questions.length} more question(s) to reach the minimum of 10 questions per quiz.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Question List */}
                        {quizForm.questions.length > 0 && editingQuestionIndex === null && (
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleQuestionDragEnd}
                          >
                            <SortableContext
                              items={quizForm.questions.map((_, index) => `question-${index}`)}
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="space-y-2 mb-4">
                                {quizForm.questions.map((question, index) => (
                                  <SortableQuestionItem
                                    key={`question-${index}`}
                                    question={question}
                                    index={index}
                                    isEditing={isEditing}
                                    onEdit={() => handleEditQuestion(index)}
                                    onDelete={() => handleDeleteQuestion(index)}
                                    totalQuestions={quizForm.questions.length}
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        )}

                        {/* Question Editor */}
                        {editingQuestionIndex !== null && (
                          <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border-2 border-brand-500 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                {editingQuestionIndex === quizForm.questions.length ? 'New Question' : `Edit Question ${editingQuestionIndex + 1}`}
                              </h4>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={handleCancelQuestionEdit}
                                  className="px-3 py-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg font-medium text-sm transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveQuestion}
                                  className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium text-sm transition-colors"
                                >
                                  Save Question
                                </button>
                              </div>
                            </div>

                            {/* Question Type */}
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Question Type *
                              </label>
                              <QuestionTypeSelector
                                value={questionForm.type}
                                onChange={(type) => handleQuestionFormChange('type', type)}
                              />
                            </div>

                            {/* Question Text */}
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Question *
                              </label>
                              <textarea
                                value={questionForm.question}
                                onChange={(e) => handleQuestionFormChange('question', e.target.value)}
                                rows={3}
                                placeholder="Enter your question..."
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg resize-none"
                              />
                            </div>

                            {/* Points */}
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Points
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={questionForm.points}
                                onChange={(e) => handleQuestionFormChange('points', parseInt(e.target.value) || 1)}
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg"
                              />
                            </div>

                            {/* Media Attachments - Collapsible */}
                            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setShowMediaSection(!showMediaSection)}
                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 flex items-center justify-between transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Media Attachments (Optional)
                                  </span>
                                  {(questionForm.hasExistingVideo || questionForm.hasExistingImage || questionForm.videoFile || questionForm.imageFile) && (
                                    <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                                      {[questionForm.hasExistingVideo || questionForm.videoFile, questionForm.hasExistingImage || questionForm.imageFile].filter(Boolean).length} attached
                                    </span>
                                  )}
                                </div>
                                <svg 
                                  className={`w-5 h-5 text-neutral-600 dark:text-neutral-400 transition-transform ${showMediaSection ? 'rotate-180' : ''}`} 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>

                              {showMediaSection && (
                                <div className="p-4 space-y-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700">
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Attach an image or video to this question (only one media type allowed)
                                  </p>

                                  {/* Video Upload */}
                                  <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                      Video
                                    </label>
                                    {questionForm.hasExistingVideo && !questionForm.videoFile && questionForm.questionId && (
                                      <div className="mb-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                          </svg>
                                          <span className="text-sm text-green-800 dark:text-green-200">
                                            Video attached
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            if (confirm('Remove video from this question?')) {
                                              try {
                                                const token = localStorage.getItem('token');
                                                const response = await fetch(`/api/quizzes/questions/${questionForm.questionId}/video`, {
                                                  method: 'DELETE',
                                                  headers: { 'Authorization': `Bearer ${token}` }
                                                });
                                                if (response.ok) {
                                                  setQuestionForm(prev => ({ ...prev, hasExistingVideo: false }));
                                                  alert('Video removed');
                                                }
                                              } catch (error) {
                                                alert('Failed to remove video');
                                              }
                                            }
                                          }}
                                          className="text-xs text-red-600 dark:text-red-400 hover:underline"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    )}
                                    {(questionForm.hasExistingImage || questionForm.imageFile) && (
                                      <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
                                        ⚠️ Remove the image first to attach a video
                                      </div>
                                    )}
                                    <FileUpload
                                      type="video"
                                      file={questionForm.videoFile}
                                      onChange={(file) => handleQuestionFormChange('videoFile', file)}
                                      onRemove={() => handleQuestionFormChange('videoFile', null)}
                                      disabled={questionForm.hasExistingImage || !!questionForm.imageFile}
                                    />
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                      MP4, WebM, or OGG up to 100MB
                                    </p>
                                  </div>

                                  {/* Image Upload */}
                                  <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                      Image
                                    </label>
                                    {questionForm.hasExistingImage && !questionForm.imageFile && questionForm.questionId && (
                                      <div className="mb-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                          <span className="text-sm text-green-800 dark:text-green-200">
                                            Image attached
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            if (confirm('Remove image from this question?')) {
                                              try {
                                                const token = localStorage.getItem('token');
                                                const response = await fetch(`/api/quizzes/questions/${questionForm.questionId}/image`, {
                                                  method: 'DELETE',
                                                  headers: { 'Authorization': `Bearer ${token}` }
                                                });
                                                if (response.ok) {
                                                  setQuestionForm(prev => ({ ...prev, hasExistingImage: false }));
                                                  alert('Image removed');
                                                }
                                              } catch (error) {
                                                alert('Failed to remove image');
                                              }
                                            }
                                          }}
                                          className="text-xs text-red-600 dark:text-red-400 hover:underline"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    )}
                                    {(questionForm.hasExistingVideo || questionForm.videoFile) && (
                                      <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
                                        ⚠️ Remove the video first to attach an image
                                      </div>
                                    )}
                                    <FileUpload
                                      type="image"
                                      file={questionForm.imageFile}
                                      onChange={(file) => handleQuestionFormChange('imageFile', file)}
                                      onRemove={() => handleQuestionFormChange('imageFile', null)}
                                      disabled={questionForm.hasExistingVideo || !!questionForm.videoFile}
                                    />
                                    
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                      JPEG, PNG, GIF, or WebP up to 10MB
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Correct Answer (for IDENTIFICATION and FILL_BLANK) */}
                            {['IDENTIFICATION', 'FILL_BLANK'].includes(questionForm.type) && (
                              <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                  Correct Answer *
                                </label>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                                  Enter the correct answer (case-insensitive matching)
                                </p>
                                <input
                                  type="text"
                                  value={questionForm.options[0]?.optionText || ''}
                                  onChange={(e) => {
                                    const answer = e.target.value;
                                    setQuestionForm(prev => ({
                                      ...prev,
                                      options: [{
                                        optionText: answer,
                                        isCorrect: true,
                                        position: 1
                                      }]
                                    }));
                                  }}
                                  placeholder="Enter the correct answer..."
                                  className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg"
                                />
                                {questionForm.caseSensitive && (
                                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                    ⚠️ Case-sensitive matching is enabled
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Options (for multiple choice, etc.) */}
                            {['MULTIPLE_CHOICE', 'TRUE_FALSE', 'MULTIPLE_ANSWER'].includes(questionForm.type) && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                      Options *
                                    </label>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                      {questionForm.type === 'MULTIPLE_ANSWER' 
                                        ? 'Check all correct answers' 
                                        : 'Select the correct answer'
                                      }
                                    </p>
                                  </div>
                                  {questionForm.type !== 'TRUE_FALSE' && (
                                    <button
                                      onClick={handleAddOption}
                                      className="px-2 py-1 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded font-medium text-xs"
                                    >
                                      + Add Option
                                    </button>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  {questionForm.options.map((option, index) => (
                                    <div key={index} className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                      option.isCorrect 
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600' 
                                        : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600'
                                    }`}>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type={questionForm.type === 'MULTIPLE_ANSWER' ? 'checkbox' : 'radio'}
                                          name={questionForm.type === 'MULTIPLE_ANSWER' ? undefined : 'correct-answer'}
                                          checked={option.isCorrect === true}
                                          onChange={(e) => {
                                            console.log(`🔘 Option ${index} "${option.optionText}" isCorrect changed to:`, e.target.checked);
                                            if (questionForm.type === 'MULTIPLE_ANSWER') {
                                              handleOptionChange(index, 'isCorrect', e.target.checked);
                                            } else {
                                              // Radio - uncheck all others
                                              setQuestionForm(prev => ({
                                                ...prev,
                                                options: prev.options.map((opt, i) => ({
                                                  ...opt,
                                                  isCorrect: i === index
                                                }))
                                              }));
                                            }
                                          }}
                                          className="w-5 h-5 text-green-600 focus:ring-green-500"
                                        />
                                        {option.isCorrect && (
                                          <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider px-2 py-0.5 bg-green-200 dark:bg-green-800 rounded">
                                            ✓ Correct
                                          </span>
                                        )}
                                      </div>
                                      <input
                                        type="text"
                                        value={option.optionText || ''}
                                        onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                        className={`flex-1 px-4 py-2 border rounded-lg ${
                                          option.isCorrect
                                            ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 font-medium'
                                            : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600'
                                        }`}
                                      />
                                      {questionForm.type !== 'TRUE_FALSE' && questionForm.options.length > 2 && (
                                        <button
                                          onClick={() => handleRemoveOption(index)}
                                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Empty State */}
                        {quizForm.questions.length === 0 && editingQuestionIndex === null && (
                          <div className="text-center py-8 text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-3">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="font-medium mb-1">No questions yet</p>
                            <p className="text-xs">Click "Add Question" to create your first question</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <QuizAnalytics statistics={statistics} />
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {selectedQuiz && (
        <QuizModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          quiz={{
            ...selectedQuiz,
            // Use the latest form values for title/description/settings
            title: quizForm.title,
            description: quizForm.description,
            instructions: quizForm.instructions,
            passingScore: quizForm.passingScore,
            timeLimit: quizForm.timeLimit,
            // Use selectedQuiz.questions (from API) which includes imageMime and videoPath
            questions: selectedQuiz.questions.map((q) => ({
              ...q,
              // Keep all fields from the API response including imageMime, videoPath, etc.
              // Override with any form changes if needed
              question: quizForm.questions.find(fq => fq.id === q.id)?.question || q.question,
              points: quizForm.questions.find(fq => fq.id === q.id)?.points || q.points,
              options: q.options
            }))
          }}
          onSubmit={(data) => {
            console.log('Preview submission:', data);
            setIsPreviewOpen(false);
            alert('This is a preview. Submission not saved.');
          }}
        />
      )}
    </div>
  );
}
