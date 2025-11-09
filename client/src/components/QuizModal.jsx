import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * QuizModal - Dynamic component for displaying and taking quizzes
 * 
 * Features:
 * - Supports multiple question types: multiple choice, true/false, identification, essay, multiple answer
 * - Media support: video, image, text questions
 * - Dynamic input controls based on question type
 * - Navigation: next/prev buttons, keyboard arrows, question indicators
 * - Timer (if quiz has time limit)
 * - Answer tracking and validation
 * - Smooth animations for transitions
 * - Responsive design
 */
export default function QuizModal({ isOpen, onClose, quiz, onSubmit, onQuizComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEndQuizConfirm, setShowEndQuizConfirm] = useState(false);
  const [questionReactions, setQuestionReactions] = useState({}); // { questionId: { isLike: boolean } }

  // Initialize quiz
  useEffect(() => {
    if (isOpen && quiz) {
      console.log('QuizModal opened, quiz:', quiz);
      console.log('📊 Full quiz data:', JSON.stringify(quiz, null, 2));
      console.log('📋 Questions with media:', quiz.questions?.map(q => ({
        id: q.id,
        question: q.question,
        hasImageMime: !!q.imageMime,
        hasVideoPath: !!q.videoPath,
        imageMime: q.imageMime,
        videoPath: q.videoPath
      })));
      
      // Only reset if we don't have results showing
      // This prevents clearing results when modal stays open
      if (!quizResult) {
        setCurrentQuestion(0);
        setAnswers({});
        setDirection('next');
        setImageError(null);
        setShowConfirmSubmit(false);
        setShowEndQuizConfirm(false);
        setHasStarted(false);
        setIsSubmitting(false);
        
        // Initialize time limit
        if (quiz.timeLimit) {
          setTimeRemaining(quiz.timeLimit); // in seconds
        } else {
          setTimeRemaining(null);
        }

        // Load user's existing reactions for all questions
        loadQuestionReactions();
      }
    }
    
    // Reset everything when modal closes
    if (!isOpen) {
      setQuizResult(null);
      setCurrentQuestion(0);
      setAnswers({});
      setHasStarted(false);
      setIsSubmitting(false);
      setQuestionReactions({});
    }
  }, [isOpen, quiz]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || !hasStarted || timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - auto submit
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, hasStarted, timeRemaining]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !hasStarted) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevQuestion();
      } else if (e.key === 'ArrowRight') {
        handleNextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasStarted, currentQuestion, quiz]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Debug: Log media properties when question changes
  useEffect(() => {
    if (isOpen && quiz && quiz.questions?.[currentQuestion]) {
      const currentQuestionData = quiz.questions[currentQuestion];
      console.log('📋 Current Question Data:', {
        id: currentQuestionData.id,
        question: currentQuestionData.question,
        hasImageMime: !!currentQuestionData.imageMime,
        hasVideoPath: !!currentQuestionData.videoPath,
        imageMime: currentQuestionData.imageMime,
        videoPath: currentQuestionData.videoPath,
        allKeys: Object.keys(currentQuestionData)
      });
    }
  }, [isOpen, quiz, currentQuestion]);

  const handleStartQuiz = () => {
    setHasStarted(true);
  };

  const loadQuestionReactions = async () => {
    if (!quiz?.id) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/quizzes/${quiz.id}/reactions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.questions) {
          // Convert to { questionId: { isLike: boolean } } format
          const reactionsMap = {};
          result.data.questions.forEach(q => {
            if (q.userReaction) {
              reactionsMap[q.questionId] = {
                isLike: q.userReaction === 'like'
              };
            }
          });
          setQuestionReactions(reactionsMap);
        }
      }
    } catch (error) {
      console.error('Error loading question reactions:', error);
    }
  };

  const handleReactionToggle = async (questionId, isLike) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to react to questions');
        return;
      }

      // Optimistic update
      const currentReaction = questionReactions[questionId];
      const newReactions = { ...questionReactions };
      
      // If clicking the same reaction, remove it
      if (currentReaction && currentReaction.isLike === isLike) {
        delete newReactions[questionId];
      } else {
        // Otherwise, set new reaction
        newReactions[questionId] = { isLike };
      }
      
      setQuestionReactions(newReactions);

      // Send to API
      const response = await fetch(`/api/quiz-questions/${questionId}/reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isLike })
      });

      if (!response.ok) {
        // Revert on error
        setQuestionReactions(questionReactions);
        console.error('Failed to toggle reaction');
      }
    } catch (error) {
      // Revert on error
      setQuestionReactions(questionReactions);
      console.error('Error toggling reaction:', error);
    }
  };

  const handleEndQuizEarly = () => {
    setShowEndQuizConfirm(true);
  };

  const confirmEndQuizEarly = () => {
    setShowEndQuizConfirm(false);
    onClose();
  };

  const handleNextQuestion = () => {
    if (isAnimating || !quiz?.questions) return;
    if (currentQuestion < quiz.questions.length - 1) {
      setDirection('next');
      setIsAnimating(true);
      setImageError(null);
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handlePrevQuestion = () => {
    if (isAnimating || !quiz?.questions) return;
    if (currentQuestion > 0) {
      setDirection('prev');
      setIsAnimating(true);
      setImageError(null);
      setTimeout(() => {
        setCurrentQuestion((prev) => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const goToQuestion = (index) => {
    if (isAnimating || index === currentQuestion || !quiz?.questions) return;
    setDirection(index > currentQuestion ? 'next' : 'prev');
    setIsAnimating(true);
    setImageError(null);
    setTimeout(() => {
      setCurrentQuestion(index);
      setIsAnimating(false);
    }, 300);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleMultipleAnswerToggle = (questionId, optionId) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const newValue = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return {
        ...prev,
        [questionId]: newValue
      };
    });
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    console.log('🚀 Starting quiz submission...');
    
    // Format answers for submission
    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => {
      const question = quiz.questions.find(q => q.id === parseInt(questionId));
      
      if (!question) return null;

      // Format based on question type
      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
        return {
          questionId: parseInt(questionId),
          selectedOptionId: answer
        };
      } else if (question.type === 'MULTIPLE_ANSWER') {
        return {
          questionId: parseInt(questionId),
          selectedOptionId: answer // array of option IDs
        };
      } else if (question.type === 'IDENTIFICATION' || question.type === 'FILL_BLANK' || question.type === 'ESSAY') {
        return {
          questionId: parseInt(questionId),
          answerText: answer
        };
      }
      
      return null;
    }).filter(Boolean);

    const timeSpent = quiz.timeLimit ? quiz.timeLimit - (timeRemaining || 0) : 0;

    try {
      console.log('📤 Calling onSubmit with data:', {
        quizId: quiz.id,
        answersCount: formattedAnswers.length,
        timeSpent
      });
      
      // Call onSubmit which returns the result
      const result = await onSubmit({
        quizId: quiz.id,
        answers: formattedAnswers,
        timeSpent
      });

      console.log('📊 Quiz result received in QuizModal:', result);
      console.log('📊 Result properties:', {
        hasResult: !!result,
        score: result?.score,
        passed: result?.passed,
        resultType: typeof result,
        resultKeys: result ? Object.keys(result) : []
      });
      
      // Show results inside the modal
      if (result) {
        setQuizResult(result);
        console.log('✅ Quiz result state set successfully');
      } else {
        console.error('❌ Result is null or undefined!');
      }
      
      setIsSubmitting(false);
    } catch (error) {
      console.error('❌ Error submitting quiz:', error);
      setIsSubmitting(false);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const handleCloseResults = () => {
    // Close the entire modal after viewing results
    const passed = quizResult?.passed || false;
    setQuizResult(null);
    onClose();
    
    // Call parent's onQuizComplete if provided
    if (onQuizComplete) {
      onQuizComplete(passed);
    }
  };

  const handleRetakeQuiz = () => {
    // Reset quiz state for retake
    setQuizResult(null);
    setCurrentQuestion(0);
    setAnswers({});
    setHasStarted(false);
    setQuestionReactions({});
    if (quiz.timeLimit) {
      setTimeRemaining(quiz.timeLimit);
    }
    // Reload reactions
    loadQuestionReactions();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !quiz) return null;

  const currentQuestionData = quiz.questions?.[currentQuestion];
  const totalQuestions = quiz.questions?.length || 0;
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  // Results screen - Show results inside the quiz modal
  if (quizResult) {
    console.log('✅ Rendering results view with:', quizResult);
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className={`absolute inset-0 ${quizResult.passed ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 'bg-gradient-to-br from-red-400 to-rose-600'}`}></div>
          </div>

          {/* Content */}
          <div className="relative p-8 text-center">
            {/* Animated Icon */}
            <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center transform transition-all duration-700 ${
              quizResult.passed 
                ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 scale-100 rotate-0' 
                : 'bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 scale-100 rotate-0'
            } animate-bounce-in`}>
              {quizResult.passed ? (
                <svg className="w-16 h-16 text-green-600 dark:text-green-400 animate-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-16 h-16 text-red-600 dark:text-red-400 animate-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>

            {/* Title */}
            <h3 className={`text-4xl font-black mb-4 animate-slide-up ${
              quizResult.passed 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {quizResult.passed ? '🎉 Congratulations!' : '📚 Keep Learning!'}
            </h3>

            {/* Status Message */}
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 animate-slide-up animation-delay-100">
              {quizResult.passed 
                ? 'You passed the quiz!' 
                : `You need ${quiz.passingScore}% to pass. Try again!`}
            </p>

            {/* Score Display */}
            <div className="mb-8 p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl animate-slide-up animation-delay-200">
              <div className="text-6xl font-black mb-2 bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent animate-number-count">
                {Math.round(quizResult.score)}%
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Your Score
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    quizResult.passed 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-r from-red-500 to-rose-500'
                  }`}
                  style={{ width: `${quizResult.score}%` }}
                ></div>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-neutral-500 dark:text-neutral-400">Passing Score</div>
                  <div className="text-lg font-bold text-neutral-700 dark:text-neutral-300">{quiz.passingScore}%</div>
                </div>
                <div>
                  <div className="text-neutral-500 dark:text-neutral-400">Attempts</div>
                  <div className="text-lg font-bold text-neutral-700 dark:text-neutral-300">{quizResult.attempts || 1}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-300">
              {quizResult.passed ? (
                <button
                  onClick={handleCloseResults}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Continue Learning
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRetakeQuiz}
                    className="px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Retake Quiz
                  </button>
                  <button
                    onClick={handleCloseResults}
                    className="px-8 py-4 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Review Module
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Add animations */}
        <style jsx>{`
          @keyframes bounce-in {
            0% { transform: scale(0) rotate(-180deg); opacity: 0; }
            50% { transform: scale(1.1) rotate(10deg); }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes slide-up {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes check {
            0% { stroke-dashoffset: 100; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes x {
            0% { stroke-dashoffset: 100; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes number-count {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-bounce-in {
            animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
          .animate-slide-up {
            animation: slide-up 0.5s ease-out forwards;
          }
          .animation-delay-100 {
            animation-delay: 0.1s;
            opacity: 0;
          }
          .animation-delay-200 {
            animation-delay: 0.2s;
            opacity: 0;
          }
          .animation-delay-300 {
            animation-delay: 0.3s;
            opacity: 0;
          }
          .animate-check {
            stroke-dasharray: 100;
            animation: check 0.6s ease-out 0.3s forwards;
          }
          .animate-x {
            stroke-dasharray: 100;
            animation: x 0.6s ease-out 0.3s forwards;
          }
          .animate-number-count {
            animation: number-count 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.4s forwards;
          }
        `}</style>
      </div>
    );
  }

  // Start screen
  if (!hasStarted) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      >
        <div
          className={`relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-white/90 dark:bg-neutral-800/90 hover:bg-white dark:hover:bg-neutral-800 rounded-full shadow-lg transition-all hover:scale-110 group"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6 text-neutral-700 dark:text-neutral-300 group-hover:text-brand-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Start Screen Content */}
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-100 dark:bg-brand-900/30 rounded-full mb-6">
              <svg className="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
              {quiz.title}
            </h2>
            
            {quiz.description && (
              <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-xl mx-auto">
                {quiz.description}
              </p>
            )}

            {/* Quiz Info */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
              <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <div className="text-2xl font-bold text-brand-600 mb-1">{totalQuestions}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Questions</div>
              </div>
              <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <div className="text-2xl font-bold text-brand-600 mb-1">
                  {quiz.timeLimit ? formatTime(quiz.timeLimit) : '∞'}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Time Limit</div>
              </div>
              <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <div className="text-2xl font-bold text-brand-600 mb-1">{quiz.passingScore}%</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Passing Score</div>
              </div>
              <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <div className="text-2xl font-bold text-brand-600 mb-1">
                  {quiz.maxAttempts || '∞'}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Max Attempts</div>
              </div>
            </div>

            {/* Instructions */}
            {quiz.instructions && (
              <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 max-w-xl mx-auto">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  Instructions
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-line">
                  {quiz.instructions}
                </p>
              </div>
            )}

            {/* Start Button */}
            <button
              onClick={handleStartQuiz}
              className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-3 mx-auto"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz taking screen
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          // Prevent accidental closes during quiz
          if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
            onClose();
          }
        }
      }}
    >
      {/* Modal Container */}
      <div
        className={`relative w-full max-w-5xl h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 flex flex-col ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
          {/* Progress Bar */}
          <div className="h-1 bg-neutral-200 dark:bg-neutral-700">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Header Content */}
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {quiz.title}
              </h2>
              <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Question {currentQuestion + 1} / {totalQuestions}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              {timeRemaining !== null && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-semibold ${
                  timeRemaining < 60 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatTime(timeRemaining)}
                </div>
              )}

              {/* Progress indicator */}
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {answeredCount} / {totalQuestions} answered
              </div>

              {/* End Quiz Early Button */}
              <button
                onClick={handleEndQuizEarly}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg font-semibold text-sm transition-all flex items-center gap-2"
                title="End quiz and exit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                End Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-hidden">
          <div
            className={`transition-all duration-500 ease-in-out h-full ${
              isAnimating
                ? direction === 'next'
                  ? '-translate-x-full opacity-0'
                  : 'translate-x-full opacity-0'
                : 'translate-x-0 opacity-100'
            }`}
          >
            {currentQuestionData && (
              <div className="h-full flex flex-col">
                {/* Media Section - Only show for questions with media */}
                {(currentQuestionData.imageMime || currentQuestionData.videoPath) && (
                  <div className="flex-shrink-0 h-[45%] bg-neutral-900 dark:bg-neutral-950 flex items-center justify-center p-4 lg:p-6">
                    {/* Image Question */}
                    {currentQuestionData.imageMime && (
                      <div className="w-full h-full flex items-center justify-center">
                        {imageError === currentQuestion ? (
                          <div className="text-center p-8">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                              <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
                              Image Not Available
                            </h3>
                            <p className="text-red-700 dark:text-red-300">
                              This question's image could not be loaded.
                            </p>
                          </div>
                        ) : (
                          <img
                            src={`/api/quizzes/questions/${currentQuestionData.id}/image`}
                            alt="Question"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            onError={() => setImageError(currentQuestion)}
                            onLoad={() => setImageError(null)}
                          />
                        )}
                      </div>
                    )}

                    {/* Video Question */}
                    {currentQuestionData.videoPath && !currentQuestionData.imageMime && (
                      <div className="w-full h-full flex items-center justify-center">
                        <video
                          key={currentQuestion}
                          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                          controls
                          autoPlay
                          loop
                          playsInline
                          src={`/api/quizzes/questions/${currentQuestionData.id}/video`}
                          onError={(e) => console.error('Video error:', e)}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>
                )}

                {/* Question & Answer Section */}
                <div className={`flex flex-col overflow-hidden ${
                  currentQuestionData.imageMime || currentQuestionData.videoPath 
                    ? 'flex-1' 
                    : 'h-full justify-center'
                }`}>
                  {/* Question Text - Only show at top if there's media */}
                  {(currentQuestionData.imageMime || currentQuestionData.videoPath) && (
                    <div className="flex-shrink-0 px-6 py-4 lg:px-8 lg:py-6 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {currentQuestion + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg lg:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2 break-words">
                            {currentQuestionData.question}
                          </h3>
                          <div className="flex items-center gap-3 flex-wrap">
                            {currentQuestionData.points && (
                              <span className="inline-block px-2 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded text-xs font-medium">
                                {currentQuestionData.points} {currentQuestionData.points === 1 ? 'point' : 'points'}
                              </span>
                            )}
                            
                            {/* Like/Dislike Reactions - Compact */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleReactionToggle(currentQuestionData.id, true)}
                                className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${
                                  questionReactions[currentQuestionData.id]?.isLike === true
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-green-50'
                                }`}
                                title="Like this question"
                              >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleReactionToggle(currentQuestionData.id, false)}
                              className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${
                                questionReactions[currentQuestionData.id]?.isLike === false
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-red-50'
                              }`}
                              title="Dislike this question"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Answer Options Section */}
                  <div className={`flex-1 min-h-0 overflow-y-auto px-6 py-4 lg:px-8 lg:py-6 space-y-4 ${
                    currentQuestionData.imageMime || currentQuestionData.videoPath 
                      ? 'bg-neutral-50 dark:bg-neutral-900' 
                      : 'bg-white dark:bg-neutral-900 max-w-4xl mx-auto w-full'
                  }`}>
                    {/* Text-only question: show full question in answer area */}
                    {!currentQuestionData.imageMime && !currentQuestionData.videoPath && (
                      <div className="mb-6 p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold">
                            {currentQuestion + 1}
                          </div>
                          <h3 className="flex-1 text-xl lg:text-2xl font-bold text-neutral-900 dark:text-neutral-100 break-words">
                            {currentQuestionData.question}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          {currentQuestionData.points && (
                            <span className="inline-block px-3 py-1.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-full text-sm font-medium">
                              {currentQuestionData.points} {currentQuestionData.points === 1 ? 'point' : 'points'}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleReactionToggle(currentQuestionData.id, true)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded transition-all ${
                                questionReactions[currentQuestionData.id]?.isLike === true
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : 'bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-green-50'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleReactionToggle(currentQuestionData.id, false)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded transition-all ${
                                questionReactions[currentQuestionData.id]?.isLike === false
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                  : 'bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-red-50'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Multiple Choice */}
                    {currentQuestionData.type === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-4">
                          Select one answer:
                        </p>
                        {currentQuestionData.options?.map((option) => (
                          <label
                            key={option.id}
                            className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              answers[currentQuestionData.id] === option.id
                                ? 'border-brand-600 bg-white dark:bg-brand-900/20'
                                : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-brand-300 dark:hover:border-brand-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${currentQuestionData.id}`}
                              value={option.id}
                              checked={answers[currentQuestionData.id] === option.id}
                              onChange={() => handleAnswerChange(currentQuestionData.id, option.id)}
                              className="w-5 h-5 text-brand-600 focus:ring-brand-500 flex-shrink-0"
                            />
                            <span className="flex-1 text-neutral-900 dark:text-neutral-100 font-medium break-words">
                              {option.optionText}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* True/False */}
                    {currentQuestionData.type === 'TRUE_FALSE' && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-4">
                          Select True or False:
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          {currentQuestionData.options?.map((option) => (
                            <label
                              key={option.id}
                              className={`flex items-center justify-center gap-3 p-6 rounded-lg border-2 cursor-pointer transition-all ${
                                answers[currentQuestionData.id] === option.id
                                  ? 'border-brand-600 bg-white dark:bg-brand-900/20'
                                  : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-brand-300 dark:hover:border-brand-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${currentQuestionData.id}`}
                                value={option.id}
                                checked={answers[currentQuestionData.id] === option.id}
                                onChange={() => handleAnswerChange(currentQuestionData.id, option.id)}
                                className="w-5 h-5 text-brand-600 focus:ring-brand-500"
                              />
                              <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                {option.optionText}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Multiple Answer */}
                    {currentQuestionData.type === 'MULTIPLE_ANSWER' && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-4">
                          Select all that apply:
                        </p>
                        {currentQuestionData.options?.map((option) => {
                          const currentAnswers = answers[currentQuestionData.id];
                          const answerArray = Array.isArray(currentAnswers) ? currentAnswers : [];
                          const isChecked = answerArray.includes(option.id);
                          
                          return (
                            <label
                              key={option.id}
                              className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                isChecked
                                  ? 'border-brand-600 bg-white dark:bg-brand-900/20'
                                  : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-brand-300 dark:hover:border-brand-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleMultipleAnswerToggle(currentQuestionData.id, option.id)}
                                className="w-5 h-5 text-brand-600 focus:ring-brand-500 rounded flex-shrink-0"
                              />
                              <span className="flex-1 text-neutral-900 dark:text-neutral-100 font-medium break-words">
                                {option.optionText}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Identification / Fill in the Blank */}
                    {(currentQuestionData.type === 'IDENTIFICATION' || currentQuestionData.type === 'FILL_BLANK') && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">
                          Your answer:
                        </label>
                        <input
                          type="text"
                          value={answers[currentQuestionData.id] || ''}
                          onChange={(e) => handleAnswerChange(currentQuestionData.id, e.target.value)}
                          placeholder="Type your answer here..."
                          className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 dark:text-neutral-100 transition-all"
                        />
                        {currentQuestionData.caseSensitive && (
                          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                            Case sensitive answer
                          </p>
                        )}
                      </div>
                    )}

                    {/* Essay */}
                    {currentQuestionData.type === 'ESSAY' && (
                      <div>
                        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">
                          Your answer:
                        </label>
                        <textarea
                          value={answers[currentQuestionData.id] || ''}
                          onChange={(e) => handleAnswerChange(currentQuestionData.id, e.target.value)}
                          placeholder="Type your answer here... Explain in detail."
                          rows={6}
                          className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 dark:text-neutral-100 resize-none transition-all"
                        />
                        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                          This answer will be reviewed manually by an instructor.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex-shrink-0 px-8 py-4 bg-neutral-50 dark:bg-neutral-800 border-t-2 border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            {/* Previous Button */}
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0 || isAnimating}
              className="px-6 py-3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {/* Question Indicators */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-md">
              {quiz.questions?.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(index)}
                  disabled={isAnimating}
                  className={`flex-shrink-0 w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                    index === currentQuestion
                      ? 'bg-brand-600 text-white'
                      : answers[q.id]
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-500'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                  }`}
                  title={answers[q.id] ? 'Answered' : 'Not answered'}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {/* Next/Submit Button */}
            {isLastQuestion ? (
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                Submit Quiz
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={isAnimating}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl p-8 max-w-md mx-4">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Submit Quiz?
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-2">
              You have answered {answeredCount} out of {totalQuestions} questions.
            </p>
            {answeredCount < totalQuestions && (
              <p className="text-amber-600 dark:text-amber-400 text-sm mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {totalQuestions - answeredCount} question(s) not answered will be marked as incorrect.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-6 py-3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuiz}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Quiz Early Confirmation Modal */}
      {showEndQuizConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl p-8 max-w-md mx-4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 text-center">
              End Quiz Early?
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-2 text-center">
              Are you sure you want to exit this quiz?
            </p>
            <p className="text-red-600 dark:text-red-400 text-sm mb-6 text-center font-medium">
              Your progress will be lost and won't be submitted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndQuizConfirm(false)}
                className="flex-1 px-6 py-3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg font-semibold transition-all"
              >
                Continue Quiz
              </button>
              <button
                onClick={confirmEndQuizEarly}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
              >
                End Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

QuizModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  quiz: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    instructions: PropTypes.string,
    passingScore: PropTypes.number,
    timeLimit: PropTypes.number, // in seconds
    maxAttempts: PropTypes.number,
    questions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        type: PropTypes.oneOf([
          'MULTIPLE_CHOICE',
          'TRUE_FALSE',
          'IDENTIFICATION',
          'ESSAY',
          'MULTIPLE_ANSWER',
          'MATCHING',
          'FILL_BLANK'
        ]).isRequired,
        question: PropTypes.string.isRequired,
        points: PropTypes.number,
        caseSensitive: PropTypes.bool,
        imageMime: PropTypes.string,
        videoPath: PropTypes.string,
        options: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.number.isRequired,
            optionText: PropTypes.string.isRequired
          })
        )
      })
    ).isRequired
  }),
  onSubmit: PropTypes.func.isRequired,
  onQuizComplete: PropTypes.func // Optional callback when quiz is completed
};
