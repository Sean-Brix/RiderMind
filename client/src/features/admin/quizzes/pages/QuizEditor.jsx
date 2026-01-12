import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, X, Upload, Image as ImageIcon, Video as VideoIcon, Loader2, Check, Edit2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuizzes, useToast, useModules } from '../../shared';
import { LoadingSpinner } from '../../shared';
import { uploadQuestionImage, uploadQuestionVideo } from '../../../../services/quizService';
import DeleteQuizModal from '../components/DeleteQuizModal';

export default function QuizEditor() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { fetchQuizById, createQuiz, updateQuiz, deleteQuiz } = useQuizzes();
  const { modules, fetchModules } = useModules();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState({});
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentQuestionPreview, setCurrentQuestionPreview] = useState(0);
  
  const [quizForm, setQuizForm] = useState({
    title: '',
    passingScore: 70,
    isActive: false,
    moduleId: null,
    questions: []
  });

  const isNewQuiz = quizId === 'new';

  // Auto-enter edit mode for new quizzes
  useEffect(() => {
    setIsEditMode(isNewQuiz);
  }, [isNewQuiz]);

  useEffect(() => {
    fetchModules();
    if (!isNewQuiz) {
      loadQuiz();
    }
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const quiz = await fetchQuizById(quizId);
      
      setQuizForm({
        title: quiz.title || '',
        passingScore: quiz.passingScore || 70,
        isActive: quiz.isActive || false,
        moduleId: quiz.moduleId || null,
        questions: (quiz.questions || []).map(q => ({
          ...q,
          imageFile: null,
          videoFile: null,
          options: q.options || []
        }))
      });
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to load quiz' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (questionIndex, file) => {
    if (!file) return;

    const question = quizForm.questions[questionIndex];
    
    // If question has ID, upload immediately
    if (question.id) {
      try {
        setUploadingMedia({ ...uploadingMedia, [`${questionIndex}-image`]: true });
        const result = await uploadQuestionImage(question.id, file);
        
        updateQuestion(questionIndex, 'imageUrl', result.imageUrl);
        updateQuestion(questionIndex, 'imagePath', result.imagePath);
        updateQuestion(questionIndex, 'imageFile', null);
        
        showToast({ type: 'success', message: 'Image uploaded successfully' });
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to upload image' });
        console.error(error);
      } finally {
        setUploadingMedia({ ...uploadingMedia, [`${questionIndex}-image`]: false });
      }
    } else {
      // Store file temporarily with blob URL for preview
      const blobUrl = URL.createObjectURL(file);
      updateQuestion(questionIndex, 'imageUrl', blobUrl);
      updateQuestion(questionIndex, 'imageFile', file);
      // Clear video (only one media type allowed)
      updateQuestion(questionIndex, 'videoUrl', null);
      updateQuestion(questionIndex, 'videoFile', null);
      updateQuestion(questionIndex, 'videoPath', null);
      showToast({ type: 'info', message: 'Image will be uploaded after saving quiz' });
    }
  };

  const handleVideoUpload = async (questionIndex, file) => {
    if (!file) return;

    const question = quizForm.questions[questionIndex];
    
    // If question has ID, upload immediately
    if (question.id) {
      try {
        setUploadingMedia({ ...uploadingMedia, [`${questionIndex}-video`]: true });
        const result = await uploadQuestionVideo(question.id, file);
        
        updateQuestion(questionIndex, 'videoUrl', result.videoUrl);
        updateQuestion(questionIndex, 'videoPath', result.videoPath);
        updateQuestion(questionIndex, 'videoFile', null);
        
        showToast({ type: 'success', message: 'Video uploaded successfully' });
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to upload video' });
        console.error(error);
      } finally {
        setUploadingMedia({ ...uploadingMedia, [`${questionIndex}-video`]: false });
      }
    } else {
      // Store file temporarily with blob URL for preview
      const blobUrl = URL.createObjectURL(file);
      updateQuestion(questionIndex, 'videoUrl', blobUrl);
      updateQuestion(questionIndex, 'videoFile', file);
      // Clear image (only one media type allowed)
      updateQuestion(questionIndex, 'imageUrl', null);
      updateQuestion(questionIndex, 'imageFile', null);
      updateQuestion(questionIndex, 'imagePath', null);
      showToast({ type: 'info', message: 'Video will be uploaded after saving quiz' });
    }
  };

  const uploadPendingFiles = async (savedQuiz) => {
    if (!savedQuiz || !savedQuiz.questions || !Array.isArray(savedQuiz.questions)) {
      return;
    }

    const uploadPromises = [];

    for (let i = 0; i < savedQuiz.questions.length; i++) {
      const question = quizForm.questions[i];
      const savedQuestion = savedQuiz.questions[i];

      if (!question || !savedQuestion) continue;

      if (question.imageFile && savedQuestion.id) {
        uploadPromises.push(
          uploadQuestionImage(savedQuestion.id, question.imageFile)
            .catch(err => console.error(`Failed to upload image for question ${i}:`, err))
        );
      }

      if (question.videoFile && savedQuestion.id) {
        uploadPromises.push(
          uploadQuestionVideo(savedQuestion.id, question.videoFile)
            .catch(err => console.error(`Failed to upload video for question ${i}:`, err))
        );
      }
    }

    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
      showToast({ type: 'success', message: 'Media files uploaded successfully' });
    }
  };

  const handleSave = async () => {
    if (!quizForm.title.trim()) {
      showToast({ type: 'error', message: 'Quiz title is required' });
      return;
    }

    if (quizForm.passingScore < 0 || quizForm.passingScore > 100) {
      showToast({ type: 'error', message: 'Pass score must be between 0 and 100' });
      return;
    }

    if (quizForm.questions.length === 0) {
      showToast({ type: 'error', message: 'At least one question is required' });
      return;
    }

    // Validate that all questions have text
    const questionsWithoutText = quizForm.questions
      .map((q, idx) => !q.question || !q.question.trim() ? idx + 1 : null)
      .filter(num => num !== null);

    if (questionsWithoutText.length > 0) {
      showToast({ 
        type: 'error', 
        message: `Questions ${questionsWithoutText.join(', ')} must have question text` 
      });
      return;
    }

    // Validate that all questions have at least one correct answer (except ESSAY)
    const questionsWithoutCorrectAnswer = quizForm.questions.filter((q, idx) => {
      const questionType = q.type || 'MULTIPLE_CHOICE';
      // ESSAY questions don't need predefined answers
      if (questionType === 'ESSAY') return false;
      // IDENTIFICATION needs a non-empty answer
      if (questionType === 'IDENTIFICATION') {
        return !q.options.length || !q.options[0].optionText.trim();
      }
      // MULTIPLE_CHOICE and TRUE_FALSE need at least one correct option
      return !q.options.some(opt => opt.isCorrect);
    });

    if (questionsWithoutCorrectAnswer.length > 0) {
      const questionNumbers = quizForm.questions
        .map((q, idx) => {
          const questionType = q.type || 'MULTIPLE_CHOICE';
          if (questionType === 'ESSAY') return null;
          if (questionType === 'IDENTIFICATION') {
            return (!q.options.length || !q.options[0].optionText.trim()) ? idx + 1 : null;
          }
          return !q.options.some(opt => opt.isCorrect) ? idx + 1 : null;
        })
        .filter(num => num !== null)
        .join(', ');
      
      showToast({ 
        type: 'error', 
        message: `Questions ${questionNumbers} must have a correct answer` 
      });
      return;
    }

    try {
      setSaving(true);
      
      // Filter out blob URLs and temporary files from the request
      const quizData = {
        title: quizForm.title,
        passingScore: parseInt(quizForm.passingScore),
        isActive: quizForm.isActive,
        moduleId: quizForm.moduleId ? parseInt(quizForm.moduleId) : null,
        questions: quizForm.questions.map((q, idx) => {
          const questionData = {
            question: q.question,
            type: q.type || 'MULTIPLE_CHOICE',
            points: q.points || 1,
            position: idx + 1,
            imageUrl: q.imageUrl && !q.imageUrl.startsWith('blob:') ? q.imageUrl : null,
            imagePath: q.imagePath || null,
            videoUrl: q.videoUrl && !q.videoUrl.startsWith('blob:') ? q.videoUrl : null,
            videoPath: q.videoPath || null,
            options: q.options.map((opt, optIdx) => ({
              optionText: opt.optionText,
              isCorrect: opt.isCorrect,
              position: optIdx + 1
            }))
          };
          
          if (q.id) questionData.id = q.id;
          return questionData;
        })
      };

      let savedQuiz;
      if (isNewQuiz) {
        const response = await createQuiz(quizData);
        savedQuiz = response.data || response; // Handle both response formats
        showToast({ type: 'success', message: 'Quiz created successfully' });
        
        // Upload pending files
        await uploadPendingFiles(savedQuiz);
        
        // Redirect to edit page
        navigate(`/admin/quizes/${savedQuiz.id}/edit`);
      } else {
        const response = await updateQuiz(quizId, quizData);
        savedQuiz = response.data || response; // Handle both response formats
        
        // Upload pending files
        await uploadPendingFiles(savedQuiz);
        
        showToast({ type: 'success', message: 'Quiz updated successfully' });
        await loadQuiz(); // Reload to get updated question IDs
        setIsEditMode(false); // Switch to view mode after save
      }
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to save quiz' });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteQuiz(quizId);
      showToast({ type: 'success', message: 'Quiz deleted successfully' });
      navigate('/admin/quizes');
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to delete quiz' });
      console.error(error);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const addQuestion = () => {
    const newIndex = quizForm.questions.length;
    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question: '',
        type: 'MULTIPLE_CHOICE',
        points: 1,
        imageUrl: null,
        imagePath: null,
        videoUrl: null,
        videoPath: null,
        imageFile: null,
        videoFile: null,
        options: [
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false }
        ]
      }]
    }));
    setSelectedQuestionIndex(newIndex);
  };

  const removeQuestion = (index) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
    // Adjust selected index if needed
    if (selectedQuestionIndex >= quizForm.questions.length - 1) {
      setSelectedQuestionIndex(Math.max(0, quizForm.questions.length - 2));
    }
  };

  const updateQuestion = (index, field, value) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== index) return q;
        
        const updated = { ...q, [field]: value };
        
        // Update options when type changes
        if (field === 'type') {
          if (value === 'TRUE_FALSE') {
            updated.options = [
              { optionText: 'True', isCorrect: false },
              { optionText: 'False', isCorrect: false }
            ];
          } else if (value === 'ESSAY') {
            updated.options = [];
          } else if (value === 'IDENTIFICATION') {
            updated.options = [
              { optionText: '', isCorrect: true }
            ];
          } else if (value === 'MULTIPLE_CHOICE') {
            updated.options = [
              { optionText: '', isCorrect: false },
              { optionText: '', isCorrect: false },
              { optionText: '', isCorrect: false },
              { optionText: '', isCorrect: false }
            ];
          }
        }
        
        return updated;
      })
    }));
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, qIdx) => {
        if (qIdx !== questionIndex) return q;
        
        // If setting isCorrect to true, uncheck all others and check only this one
        if (field === 'isCorrect' && value === true) {
          return {
            ...q,
            options: q.options.map((o, i) => ({
              ...o,
              isCorrect: i === optionIndex
            }))
          };
        }
        
        // Otherwise, update only the specific field
        return {
          ...q,
          options: q.options.map((opt, oIdx) => {
            if (oIdx !== optionIndex) return opt;
            return { ...opt, [field]: value };
          })
        };
      })
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // VIEW MODE - Show quiz preview
  if (!isEditMode && !isNewQuiz) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/quizes')}
                className="p-2 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quizForm.title}
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
              Edit Quiz
            </button>
          </div>

          {/* Quiz Info Card */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-gray-200 dark:border-neutral-700 p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                quizForm.isActive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-neutral-400'
              }`}>
                {quizForm.isActive ? 'Active' : 'Inactive'}
              </span>
              {quizForm.moduleId && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium">
                  Linked to Module
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Passing Score</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{quizForm.passingScore}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Total Questions</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{quizForm.questions.length}</p>
              </div>
            </div>
          </div>

          {/* Question Viewer */}
          {quizForm.questions.length > 0 ? (
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-gray-200 dark:border-neutral-700">
              {/* Navigation Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
                <button
                  onClick={() => setCurrentQuestionPreview(Math.max(0, currentQuestionPreview - 1))}
                  disabled={currentQuestionPreview === 0}
                  className="p-2 text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Question {currentQuestionPreview + 1} of {quizForm.questions.length}
                  </p>
                </div>
                
                <button
                  onClick={() => setCurrentQuestionPreview(Math.min(quizForm.questions.length - 1, currentQuestionPreview + 1))}
                  disabled={currentQuestionPreview === quizForm.questions.length - 1}
                  className="p-2 text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Current Question */}
              {(() => {
                const question = quizForm.questions[currentQuestionPreview];
                return (
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold">
                        {currentQuestionPreview + 1}
                      </span>
                      <p className="flex-1 text-gray-900 dark:text-white font-medium">
                        {question.question || 'No question text'}
                      </p>
                    </div>
                    
                    {/* Question Media */}
                    {(question.imageUrl || question.videoUrl) && (
                      <div className="mb-4">
                        {question.imageUrl && (
                          <img 
                            src={question.imageUrl} 
                            alt="Question" 
                            className="w-full max-h-64 object-cover rounded-lg border border-gray-300 dark:border-neutral-600"
                          />
                        )}
                        {question.videoUrl && (
                          <video 
                            src={question.videoUrl} 
                            controls
                            className="w-full max-h-64 object-cover rounded-lg border border-gray-300 dark:border-neutral-600"
                          />
                        )}
                      </div>
                    )}
                    
                    {/* Options */}
                    <div className="space-y-2">
                      {question.options.map((option, oIdx) => (
                        <div 
                          key={oIdx} 
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            option.isCorrect 
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                              : 'border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-700/50'
                          }`}
                        >
                          <span className="text-sm font-medium text-gray-600 dark:text-neutral-400 w-6">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <span className={`flex-1 ${option.isCorrect ? 'font-medium text-green-900 dark:text-neutral-100' : 'text-gray-900 dark:text-white'}`}>
                            {option.optionText}
                          </span>
                          {option.isCorrect && (
                            <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                              Correct
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-gray-200 dark:border-neutral-700 p-12 text-center">
              <p className="text-gray-500 dark:text-neutral-400">No questions added yet</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // EDIT MODE
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/quizes')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isNewQuiz ? 'Create New Quiz' : 'Edit Quiz'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                {isNewQuiz ? 'Add questions and configure quiz settings' : 'Modify quiz details and questions'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isNewQuiz && (
              <>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="px-4 py-2 text-gray-700 dark:text-neutral-100 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deleting}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Quiz'}
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-gray-200 dark:border-neutral-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-100 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                value={quizForm.title}
                onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter quiz title"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-100 mb-2">
                  Pass Score (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={quizForm.passingScore}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, passingScore: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-100 mb-2">
                  Module
                </label>
                <select
                  value={quizForm.moduleId || ''}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, moduleId: e.target.value || null }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Module (Standalone)</option>
                  {modules.map(module => (
                    <option key={module.id} value={module.id}>{module.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={quizForm.isActive}
                onChange={(e) => setQuizForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-neutral-100">
                Active (visible to students)
              </label>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-gray-200 dark:border-neutral-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Questions ({quizForm.questions.length})
            </h2>
            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          {quizForm.questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-neutral-400">
              No questions yet. Click "Add Question" to create one.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Question Selector Dropdown */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-neutral-100">
                  Select Question:
                </label>
                <select
                  value={selectedQuestionIndex}
                  onChange={(e) => setSelectedQuestionIndex(parseInt(e.target.value))}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {quizForm.questions.map((q, idx) => {
                    const questionType = q.type || 'MULTIPLE_CHOICE';
                    let hasCorrectAnswer = true;
                    
                    if (questionType === 'ESSAY') {
                      hasCorrectAnswer = true; // ESSAY doesn't need correct answer
                    } else if (questionType === 'IDENTIFICATION') {
                      hasCorrectAnswer = q.options.length > 0 && q.options[0].optionText.trim() !== '';
                    } else {
                      hasCorrectAnswer = q.options.some(opt => opt.isCorrect);
                    }
                    
                    return (
                      <option key={idx} value={idx}>
                        Q{idx + 1}{!hasCorrectAnswer ? ' ⚠️' : ''}{q.question ? `: ${q.question.substring(0, 40)}${q.question.length > 40 ? '...' : ''}` : ''}
                      </option>
                    );
                  })}
                </select>
                <button
                  onClick={() => removeQuestion(selectedQuestionIndex)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                  title="Delete this question"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>

              {/* Single Question Editor */}
              {quizForm.questions[selectedQuestionIndex] && (
                <div className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-neutral-100 mb-2">
                        Question Type
                      </label>
                      <select
                        value={quizForm.questions[selectedQuestionIndex].type || 'MULTIPLE_CHOICE'}
                        onChange={e => updateQuestion(selectedQuestionIndex, 'type', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 mb-2"
                      >
                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                        <option value="TRUE_FALSE">True/False</option>
                        <option value="IDENTIFICATION">Identification</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-neutral-100 mb-2">
                        Question Text *
                      </label>
                      <textarea
                        value={quizForm.questions[selectedQuestionIndex].question}
                        onChange={(e) => updateQuestion(selectedQuestionIndex, 'question', e.target.value)}
                        placeholder="Enter question text"
                        rows="2"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Media Upload Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-neutral-100 mb-2">
                        Media (Optional)
                      </label>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {/* Image Upload */}
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-neutral-400 mb-2">Image</label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(selectedQuestionIndex, e.target.files[0])}
                              className="hidden"
                              id={`image-upload-${selectedQuestionIndex}`}
                              key={`image-${selectedQuestionIndex}-${quizForm.questions[selectedQuestionIndex].imageUrl ? 'has' : 'empty'}`}
                            />
                            <label
                              htmlFor={`image-upload-${selectedQuestionIndex}`}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                            >
                              {uploadingMedia[`${selectedQuestionIndex}-image`] ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : quizForm.questions[selectedQuestionIndex].imageUrl && !quizForm.questions[selectedQuestionIndex].imageFile ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  Image Uploaded
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="w-4 h-4" />
                                  {quizForm.questions[selectedQuestionIndex].imageFile ? 'Change Image' : 'Select Image'}
                                </>
                              )}
                            </label>
                            
                            {quizForm.questions[selectedQuestionIndex].imageUrl && (
                              <div className="relative">
                                <img 
                                  src={quizForm.questions[selectedQuestionIndex].imageUrl} 
                                  alt="Question preview" 
                                  className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-neutral-600"
                                />
                                <button
                                  onClick={() => {
                                    updateQuestion(selectedQuestionIndex, 'imageUrl', null);
                                    updateQuestion(selectedQuestionIndex, 'imageFile', null);
                                    updateQuestion(selectedQuestionIndex, 'imagePath', null);
                                  }}
                                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Video Upload */}
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-neutral-400 mb-2">Video</label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => handleVideoUpload(selectedQuestionIndex, e.target.files[0])}
                              className="hidden"
                              id={`video-upload-${selectedQuestionIndex}`}
                              key={`video-${selectedQuestionIndex}-${quizForm.questions[selectedQuestionIndex].videoUrl ? 'has' : 'empty'}`}
                            />
                            <label
                              htmlFor={`video-upload-${selectedQuestionIndex}`}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer"
                            >
                              {uploadingMedia[`${selectedQuestionIndex}-video`] ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : quizForm.questions[selectedQuestionIndex].videoUrl && !quizForm.questions[selectedQuestionIndex].videoFile ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  Video Uploaded
                                </>
                              ) : (
                                <>
                                  <VideoIcon className="w-4 h-4" />
                                  {quizForm.questions[selectedQuestionIndex].videoFile ? 'Change Video' : 'Select Video'}
                                </>
                              )}
                            </label>
                            
                            {quizForm.questions[selectedQuestionIndex].videoUrl && (
                              <div className="relative">
                                <video 
                                  src={quizForm.questions[selectedQuestionIndex].videoUrl} 
                                  controls
                                  className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-neutral-600"
                                />
                                <button
                                  onClick={() => {
                                    updateQuestion(selectedQuestionIndex, 'videoUrl', null);
                                    updateQuestion(selectedQuestionIndex, 'videoFile', null);
                                    updateQuestion(selectedQuestionIndex, 'videoPath', null);
                                  }}
                                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Options */}
                    {(() => {
                      const questionType = quizForm.questions[selectedQuestionIndex].type || 'MULTIPLE_CHOICE';
                      
                      if (questionType === 'ESSAY') {
                        return (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-100 mb-2">
                              Answer Type
                            </label>
                            <p className="text-sm text-gray-600 dark:text-neutral-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                              Essay questions allow students to write free-form text answers. No pre-defined options needed.
                            </p>
                          </div>
                        );
                      }
                      
                      if (questionType === 'IDENTIFICATION') {
                        return (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-100 mb-2">
                              Correct Answer *
                            </label>
                            <input
                              type="text"
                              value={quizForm.questions[selectedQuestionIndex].options[0]?.optionText || ''}
                              onChange={(e) => updateOption(selectedQuestionIndex, 0, 'optionText', e.target.value)}
                              placeholder="Enter the correct answer"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-2">
                              Students will type their answer and it will be compared with this correct answer.
                            </p>
                          </div>
                        );
                      }
                      
                      if (questionType === 'TRUE_FALSE') {
                        return (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-100 mb-2">
                              Answer Options * (Select the correct answer)
                            </label>
                            <div className="space-y-2">
                              {quizForm.questions[selectedQuestionIndex].options.map((option, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name={`question-${selectedQuestionIndex}-correct`}
                                    checked={option.isCorrect}
                                    onChange={() => updateOption(selectedQuestionIndex, oIdx, 'isCorrect', true)}
                                    className="w-4 h-4 text-green-600"
                                  />
                                  <span className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700/50 text-gray-900 dark:text-white">
                                    {option.optionText}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      
                      // MULTIPLE_CHOICE
                      return (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-100 mb-2">
                            Answer Options * (Check the correct answer)
                          </label>
                          <div className="space-y-2">
                            {quizForm.questions[selectedQuestionIndex].options.map((option, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name={`question-${selectedQuestionIndex}-correct`}
                                  checked={option.isCorrect}
                                  onChange={() => updateOption(selectedQuestionIndex, oIdx, 'isCorrect', true)}
                                  className="w-4 h-4 text-green-600"
                                />
                                <span className="text-sm text-gray-600 dark:text-neutral-400 w-4">{String.fromCharCode(65 + oIdx)}.</span>
                                <input
                                  type="text"
                                  value={option.optionText}
                                  onChange={(e) => updateOption(selectedQuestionIndex, oIdx, 'optionText', e.target.value)}
                                  placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteQuizModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        quizTitle={quizForm.title}
      />
    </div>
  );
}

