import { useState, useEffect, useCallback, useRef } from 'react';
import { BaseModal } from '../Modals/BaseModal';
import { useQuiz } from '../../hooks/useQuiz';

/**
 * QuizViewer - Quiz modal using Phase 3 architecture
 * Displays quiz questions with media support and reactions
 */
export function QuizViewer({ isOpen, onClose, quiz, moduleId, studentModuleId, onQuizComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const initializedQuizId = useRef(null);

  // Quiz state management (Phase 2 Architecture)
  const quizManager = useQuiz({
    onQuizComplete: (result) => {
      // Only show results, don't trigger parent callback yet
      setShowResults(true);
    },
    onError: (error) => {
      console.error('Quiz error:', error);
      alert(error.message);
    },
  });

  // Initialize quiz when modal opens
  useEffect(() => {
    console.log('Init effect triggered:', {
      isOpen,
      quizId: quiz?.id,
      showResults,
      initializedId: initializedQuizId.current,
      willInitialize: isOpen && quiz && !showResults && initializedQuizId.current !== quiz?.id
    });
    
    if (isOpen && quiz && !showResults) {
      // Only initialize if this is a different quiz or first time opening
      // This prevents re-initialization when modules reload after completion
      if (initializedQuizId.current !== quiz.id) {
        console.log('Initializing quiz:', quiz.id);
        quizManager.initializeQuiz(quiz, moduleId, studentModuleId);
        setCurrentQuestion(0);
        setShowSubmitConfirm(false);
        initializedQuizId.current = quiz.id;
      }
    }
    
    // Only reset when modal closes AND we're not showing results
    // This prevents reset during module completion when results are shown
    if (!isOpen && !showResults) {
      console.log('Modal closed, resetting initialized quiz ID');
      initializedQuizId.current = null;
    }
  }, [isOpen, quiz, moduleId, studentModuleId, showResults]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || showResults) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && currentQuestion > 0) {
        setCurrentQuestion(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentQuestion, showResults, quiz]);

  const handleAnswerSelect = useCallback((questionId, answer) => {
    quizManager.setAnswer(questionId, answer);
  }, [quizManager]);

  const handleSubmit = useCallback(async () => {
    console.log('Submit button clicked');
    setShowSubmitConfirm(false);
    const result = await quizManager.submitQuiz();
    console.log('Submit result:', result);
    if (result) {
      console.log('Setting showResults to true');
      setShowResults(true);
    } else {
      console.log('Submit returned null/undefined');
    }
  }, [quizManager]);

  const handleRetry = useCallback(() => {
    console.log('Retry clicked - passed:', quizManager.passed);
    if (quizManager.passed) {
      console.log('Quiz was passed, should not retry!');
      return; // Don't allow retry if passed
    }
    quizManager.clearAllAnswers();
    setCurrentQuestion(0);
    setShowResults(false);
  }, [quizManager]);

  const handleClose = useCallback(() => {
    console.log('Close clicked - passed:', quizManager.passed, 'showResults:', showResults);
    
    // If showing results and quiz was passed, trigger completion callback
    if (showResults && quizManager.passed && onQuizComplete) {
      const result = {
        passed: quizManager.passed,
        score: quizManager.score,
        attempt: quizManager.attemptId || quizManager.attempt || null,
        feedback: quizManager.feedback
      };
      console.log('Calling onQuizComplete with:', result);
      onQuizComplete(result);
    }
    
    setShowResults(false);
    setShowSubmitConfirm(false);
    onClose();
  }, [onClose, onQuizComplete, quizManager, showResults]);

  // Auto-answer all questions with correct answers (for testing)
  const handleAutoAnswer = useCallback(() => {
    if (!quiz || !quiz.questions) return;
    
    console.log('Auto-filling answers for quiz ID:', quiz.id);
    console.log('Quiz object:', quiz);
    console.log('Questions:', quiz.questions);
    
    // Batch all answer updates to avoid multiple re-renders
    const answers = {};
    
    quiz.questions.forEach(question => {
      console.log(`Question ${question.id}:`, {
        type: question.type,
        question: question.question,
        options: question.options,
        hasIsCorrect: question.options?.some(o => 'isCorrect' in o)
      });
      
      if (question.type === 'IDENTIFICATION' || question.type === 'FILL_BLANK') {
        // For text-based questions, use the correct option's text
        const correctOption = question.options.find(opt => opt.isCorrect);
        if (correctOption) {
          answers[question.id] = correctOption.optionText;
          console.log(`  ✓ Found correct answer for IDENTIFICATION: ${correctOption.optionText}`);
        } else {
          console.log(`  ✗ No correct answer found for IDENTIFICATION`);
        }
      } else if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
        // For multiple choice, use the correct option's ID
        const correctOption = question.options.find(opt => opt.isCorrect);
        if (correctOption) {
          answers[question.id] = correctOption.id;
          console.log(`  ✓ Found correct answer for ${question.type}: ${correctOption.optionText} (ID: ${correctOption.id})`);
        } else {
          console.log(`  ✗ No correct answer found for ${question.type}`);
        }
      }
    });
    
    // Set all answers at once
    Object.entries(answers).forEach(([questionId, answer]) => {
      quizManager.setAnswer(parseInt(questionId), answer);
    });
    
    console.log('Auto-filled', Object.keys(answers).length, 'answers');
  }, [quiz, quizManager]);

  if (!isOpen || !quiz) return null;

  const questions = quiz.questions || [];
  const totalQuestions = questions.length;
  const currentQuestionData = questions[currentQuestion];
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;
  const userAnswer = quizManager.answers?.[currentQuestionData?.id];

  // Show error if no questions
  if (totalQuestions === 0) {
    return (
      <BaseModal open={isOpen} onClose={onClose} size="md">
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            No Questions Available
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            This quiz doesn't have any questions yet.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold transition-all"
          >
            Close
          </button>
        </div>
      </BaseModal>
    );
  }

  // Results view
  if (showResults) {
    const { score, passed, feedback, correctCount } = quizManager;
    
    console.log('Results view - score:', score, 'passed:', passed, 'feedback:', feedback);
    
    return (
      <BaseModal open={isOpen} onClose={handleClose} size="lg">
        <div className="flex flex-col h-[80vh] overflow-hidden">
          {/* Screen Reader Announcement */}
          <div 
            role="status" 
            aria-live="assertive" 
            aria-atomic="true" 
            className="sr-only"
          >
            {`Quiz completed. You scored ${score !== undefined ? score : 0} percent. ${passed ? 'You passed!' : `You need ${quiz.passingScore} percent to pass. Try again.`}`}
          </div>
          
          {/* Results Header */}
          <div className="p-6 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-700 dark:from-brand-400 dark:to-brand-500 mb-2">
              Quiz Results
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              {quiz.title}
            </p>
          </div>

          {/* Score Display */}
          <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="max-w-md w-full">
              {/* Score Card */}
              <div className={`p-8 rounded-2xl shadow-2xl ${
                passed 
                  ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-2 border-green-500'
                  : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-2 border-red-500'
              }`}>
                <div className="text-center">
                  <div className="text-8xl font-black mb-6">
                    {passed ? '🎉' : '📚'}
                  </div>
                  <h3 className={`text-4xl font-black mb-4 ${
                    passed ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
                  }`}>
                    {passed ? 'Congratulations!' : 'Keep Practicing!'}
                  </h3>
                  <div className={`text-6xl font-black mb-6 ${
                    passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    {score !== undefined ? score : 0}%
                  </div>
                  <p className="text-lg text-neutral-700 dark:text-neutral-300">
                    Passing score: {quiz.passingScore}%
                  </p>
                  {!passed && (
                    <p className="text-neutral-600 dark:text-neutral-400 mt-4">
                      Don't give up! Try again to improve your score.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Results Actions */}
          <div className="p-6 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-center gap-3">
              {!passed && (
                <button
                  onClick={handleRetry}
                  aria-label={`Retry ${quiz.title}`}
                  className="px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg hover:scale-105 transform flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
              )}
              <button
                onClick={handleClose}
                aria-label={passed ? `Continue to next module` : `Close quiz results`}
                className={`px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg hover:scale-105 transform ${
                  passed 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                    : 'bg-neutral-600 hover:bg-neutral-700 text-white'
                }`}
              >
                {passed ? 'Continue' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      </BaseModal>
    );
  }

  // Submit confirmation dialog
  if (showSubmitConfirm) {
    const isComplete = quizManager.isQuizComplete;
    
    return (
      <BaseModal open={isOpen} onClose={() => setShowSubmitConfirm(false)} size="sm">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Submit Quiz?
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {isComplete 
                ? 'You have answered all questions. Ready to submit?'
                : 'You have not answered all questions yet. Are you sure you want to submit?'
              }
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowSubmitConfirm(false)}
              aria-label="Cancel quiz submission"
              className="px-6 py-3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg font-bold text-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={quizManager.isSubmitting}
              aria-label={`Confirm submission of ${quiz.title}`}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {quizManager.isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </BaseModal>
    );
  }

  // Quiz question view
  return (
    <BaseModal open={isOpen} onClose={onClose} size="full">
      <div className="flex flex-col h-[80vh]">
        {/* Progress Bar */}
        <div className="flex-shrink-0 h-1 bg-neutral-200 dark:bg-neutral-700">
          <div
            className="h-full bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 transition-all duration-500 ease-out shadow-lg shadow-brand-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Quiz Header */}
        <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
          {/* Super Admin Auto-Answer Button */}
          <div className="mb-3">
            <button
              onClick={handleAutoAnswer}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              🔧 Auto-Fill Correct Answers (Admin)
            </button>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-700 dark:from-brand-400 dark:to-brand-500">
              {quiz.title}
            </h2>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-100 dark:bg-brand-900/30 rounded-full text-xs font-bold text-brand-700 dark:text-brand-300 whitespace-nowrap">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Question {currentQuestion + 1} / {totalQuestions}
              </span>
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                {Math.round(progress)}% Complete
              </span>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
          {currentQuestionData && (
            <div className="max-w-4xl mx-auto">
              {/* Question Text */}
              <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-neutral-200 dark:border-neutral-700 mb-6">
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  {currentQuestionData.question}
                </h3>

                {/* Media Content */}
                {currentQuestionData.imageUrl && (
                  <div className="mb-6">
                    <img
                      src={currentQuestionData.imageUrl}
                      alt="Question media"
                      loading="lazy"
                      className="w-full max-h-96 object-contain rounded-lg shadow-lg"
                    />
                  </div>
                )}

                {currentQuestionData.videoUrl && (
                  <div className="mb-6">
                    <video
                      src={currentQuestionData.videoUrl}
                      controls
                      preload="metadata"
                      className="w-full max-h-96 object-contain rounded-lg shadow-lg"
                    />
                  </div>
                )}

                {/* Answer Options - Different UI based on question type */}
                {currentQuestionData.type === 'IDENTIFICATION' ? (
                  // Text input for IDENTIFICATION questions
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={userAnswer || ''}
                      onChange={(e) => handleAnswerSelect(currentQuestionData.id, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full p-4 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">
                      Enter your answer in the text field above
                    </p>
                  </div>
                ) : (
                  // Radio buttons for TRUE_FALSE and MULTIPLE_CHOICE questions
                  <div className="space-y-3">
                    {currentQuestionData.options && [...currentQuestionData.options]
                      .sort((a, b) => a.position - b.position)
                      .map((option, index) => (
                      <button
                        key={option.id}
                        onClick={() => handleAnswerSelect(currentQuestionData.id, option.id)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          userAnswer === option.id
                            ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-500 shadow-lg'
                            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-brand-300 dark:hover:border-brand-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            userAnswer === option.id
                              ? 'border-brand-600 bg-brand-600'
                              : 'border-neutral-300 dark:border-neutral-600'
                          }`}>
                            {userAnswer === option.id && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className={`font-medium ${
                            userAnswer === option.id
                              ? 'text-brand-900 dark:text-brand-100'
                              : 'text-neutral-700 dark:text-neutral-300'
                          }`}>
                            {String.fromCharCode(65 + index)}. {option.optionText}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Question Reactions */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  className="group px-6 py-3 bg-white dark:bg-neutral-800 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 hover:border-green-500 dark:hover:border-green-500 transition-all shadow-md hover:shadow-lg"
                  title="This question was helpful"
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform inline-block">👍</span>
                </button>
                <button
                  className="group px-6 py-3 bg-white dark:bg-neutral-800 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 hover:border-red-500 dark:hover:border-red-500 transition-all shadow-md hover:shadow-lg"
                  title="This question needs improvement"
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform inline-block">👎</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex-shrink-0 p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between gap-3">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              disabled={currentQuestion === 0}
              aria-label="Go to previous question"
              className="group px-5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 transform"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>

            {/* Question Indicators */}
            <div className="flex items-center gap-2">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(index)}
                  className={`transition-all duration-500 rounded-full ${
                    index === currentQuestion
                      ? 'w-8 h-2 bg-gradient-to-r from-brand-500 to-brand-600'
                      : quizManager.answers?.[q.id] !== undefined
                      ? 'w-2 h-2 bg-green-500'
                      : 'w-2 h-2 bg-neutral-300 dark:bg-neutral-600 hover:bg-brand-400 hover:scale-110'
                  }`}
                  aria-label={`Go to question ${index + 1}`}
                />
              ))}
            </div>

            {/* Next/Submit Button */}
            {currentQuestion === totalQuestions - 1 ? (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                aria-label={`Submit quiz: ${quiz.title}`}
                className="group px-5 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 transform"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Submit Quiz</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                aria-label="Go to next question"
                className="group px-5 py-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 transform"
              >
                <span>Next</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export default QuizViewer;
