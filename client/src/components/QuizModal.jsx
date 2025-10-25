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
export default function QuizModal({ isOpen, onClose, quiz, onSubmit }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Initialize quiz
  useEffect(() => {
    if (isOpen && quiz) {
      console.log('QuizModal opened, quiz:', quiz);
      setCurrentQuestion(0);
      setAnswers({});
      setDirection('next');
      setImageError(null);
      setShowConfirmSubmit(false);
      setHasStarted(false);
      
      // Initialize time limit
      if (quiz.timeLimit) {
        setTimeRemaining(quiz.timeLimit); // in seconds
      } else {
        setTimeRemaining(null);
      }
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

  const handleStartQuiz = () => {
    setHasStarted(true);
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

  const handleSubmitQuiz = () => {
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

    onSubmit({
      quizId: quiz.id,
      answers: formattedAnswers,
      timeSpent
    });

    onClose();
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
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto">
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
                {/* Media Content */}
                <div className="flex-1 bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center p-8">
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
                          className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
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
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                        controls
                        src={currentQuestionData.videoPath}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  {/* Text Question (no media) */}
                  {!currentQuestionData.imageMime && !currentQuestionData.videoPath && (
                    <div className="w-full max-w-3xl text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full mb-6">
                        <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                        {currentQuestionData.question}
                      </h3>
                      {currentQuestionData.points && (
                        <span className="inline-block px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-full text-sm font-medium">
                          {currentQuestionData.points} {currentQuestionData.points === 1 ? 'point' : 'points'}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Question Text (if there's media) */}
                {(currentQuestionData.imageMime || currentQuestionData.videoPath) && (
                  <div className="px-8 py-6 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-start gap-3 max-w-4xl mx-auto">
                      <div className="flex-shrink-0 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {currentQuestion + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                          {currentQuestionData.question}
                        </h3>
                        {currentQuestionData.points && (
                          <span className="inline-block px-2 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded text-xs font-medium">
                            {currentQuestionData.points} {currentQuestionData.points === 1 ? 'point' : 'points'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Answer Input Section */}
        <div className="flex-shrink-0 bg-white dark:bg-neutral-900 border-t-2 border-neutral-200 dark:border-neutral-700">
          <div className="px-8 py-6">
            <div className="max-w-4xl mx-auto">
              {currentQuestionData && (
                <>
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
                              ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20'
                              : 'border-neutral-200 dark:border-neutral-700 hover:border-brand-300 dark:hover:border-brand-700'
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
                          <span className="flex-1 text-neutral-900 dark:text-neutral-100 font-medium">
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
                                ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20'
                                : 'border-neutral-200 dark:border-neutral-700 hover:border-brand-300 dark:hover:border-brand-700'
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
                                ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20'
                                : 'border-neutral-200 dark:border-neutral-700 hover:border-brand-300 dark:hover:border-brand-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleMultipleAnswerToggle(currentQuestionData.id, option.id)}
                              className="w-5 h-5 text-brand-600 focus:ring-brand-500 rounded"
                            />
                            <span className="flex-1 text-neutral-900 dark:text-neutral-100 font-medium">
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
                        className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 dark:bg-neutral-800 dark:text-neutral-100 transition-all"
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
                        className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 dark:bg-neutral-800 dark:text-neutral-100 resize-none transition-all"
                      />
                      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                        This answer will be reviewed manually by an instructor.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="px-8 py-4 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
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
  onSubmit: PropTypes.func.isRequired
};
