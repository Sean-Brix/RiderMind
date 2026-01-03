import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, X, Upload, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { useQuizzes, useToast, useModules } from '../../shared';
import { LoadingSpinner } from '../../shared';

export default function QuizEditor() {
  const navigate = useNavigate();
  const { quizId } = useParams(); // 'new' or actual ID
  const { fetchQuizById, createQuiz, updateQuiz, deleteQuiz } = useQuizzes();
  const { modules, fetchModules } = useModules();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [quizForm, setQuizForm] = useState({
    title: '',
    passScore: 70,
    isActive: false,
    moduleId: null,
    questions: []
  });

  const isNewQuiz = quizId === 'new';

  // Load modules and quiz data
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
        passScore: quiz.passScore || 70,
        isActive: quiz.isActive || false,
        moduleId: quiz.moduleId || null,
        questions: quiz.questions || []
      });
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to load quiz' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!quizForm.title.trim()) {
      showToast({ type: 'error', message: 'Quiz title is required' });
      return;
    }

    if (quizForm.passScore < 0 || quizForm.passScore > 100) {
      showToast({ type: 'error', message: 'Pass score must be between 0 and 100' });
      return;
    }

    if (quizForm.questions.length === 0) {
      showToast({ type: 'error', message: 'At least one question is required' });
      return;
    }

    try {
      setSaving(true);
      
      const quizData = {
        title: quizForm.title,
        passScore: parseInt(quizForm.passScore),
        isActive: quizForm.isActive,
        moduleId: quizForm.moduleId || null,
        questions: quizForm.questions.map((q, idx) => ({
          ...q,
          position: idx + 1
        }))
      };

      if (isNewQuiz) {
        const response = await createQuiz(quizData);
        showToast({ type: 'success', message: 'Quiz created successfully' });
        navigate(`/admin/quizes/${response.id}/edit`);
      } else {
        await updateQuiz(quizId, quizData);
        showToast({ type: 'success', message: 'Quiz updated successfully' });
      }
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to save quiz' });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteQuiz(quizId);
      showToast({ type: 'success', message: 'Quiz deleted successfully' });
      navigate('/admin/quizes');
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to delete quiz' });
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const addQuestion = () => {
    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question: '',
        mediaUrl: null,
        mediaType: null,
        options: [
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false }
        ]
      }]
    }));
  };

  const removeQuestion = (questionIndex) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== questionIndex)
    }));
  };

  const updateQuestion = (questionIndex, field, value) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, idx) => 
        idx === questionIndex ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, qIdx) => {
        if (qIdx !== questionIndex) return q;
        
        return {
          ...q,
          options: q.options.map((opt, oIdx) => {
            if (oIdx !== optionIndex) return opt;
            
            // If setting isCorrect to true, uncheck others
            if (field === 'isCorrect' && value === true) {
              return q.options.map((o, i) => ({
                ...o,
                isCorrect: i === optionIndex
              }));
            }
            
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/quizes')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isNewQuiz ? 'Create New Quiz' : 'Edit Quiz'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isNewQuiz ? 'Add questions and configure quiz settings' : 'Modify quiz details and questions'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isNewQuiz && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Quiz'}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quiz Title *
            </label>
            <input
              type="text"
              value={quizForm.title}
              onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter quiz title"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pass Score (%) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={quizForm.passScore}
                onChange={(e) => setQuizForm(prev => ({ ...prev, passScore: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Module
              </label>
              <select
                value={quizForm.moduleId || ''}
                onChange={(e) => setQuizForm(prev => ({ ...prev, moduleId: e.target.value || null }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Active (visible to students)
            </label>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
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
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No questions yet. Click "Add Question" to create one.
          </div>
        ) : (
          <div className="space-y-6">
            {quizForm.questions.map((question, qIdx) => (
              <div key={qIdx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Question {qIdx + 1}</h3>
                  <button
                    onClick={() => removeQuestion(qIdx)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      value={question.question}
                      onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                      placeholder="Enter question text"
                      rows="2"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Media (Optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={question.mediaUrl || ''}
                        onChange={(e) => updateQuestion(qIdx, 'mediaUrl', e.target.value)}
                        placeholder="Media URL"
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={question.mediaType || ''}
                        onChange={(e) => updateQuestion(qIdx, 'mediaType', e.target.value || null)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">No Media</option>
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Answer Options * (Check the correct answer)
                    </label>
                    <div className="space-y-2">
                      {question.options.map((option, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`question-${qIdx}-correct`}
                            checked={option.isCorrect}
                            onChange={(e) => updateOption(qIdx, oIdx, 'isCorrect', e.target.checked)}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-4">{String.fromCharCode(65 + oIdx)}.</span>
                          <input
                            type="text"
                            value={option.optionText}
                            onChange={(e) => updateOption(qIdx, oIdx, 'optionText', e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
