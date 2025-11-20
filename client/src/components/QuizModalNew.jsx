import React, { useState, useEffect } from 'react';
import QuizResultsModal from './Quiz/QuizResultsModal';
import QuizStartScreen from './Quiz/QuizStartScreen';

export default function QuizModal({ isOpen, onClose, quiz, onSubmit, onQuizComplete }) {
  // Core state
  const [quizState, setQuizState] = useState('start'); // 'start', 'taking', 'results'
  const [quizResult, setQuizResult] = useState(null);
  
  // Quiz taking state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showEndQuizConfirm, setShowEndQuizConfirm] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('next');
  const [imageError, setImageError] = useState(null);
  const [questionReactions, setQuestionReactions] = useState({});

  // Reset quiz when modal opens with new quiz
  useEffect(() => {
    if (isOpen && quiz) {
      console.log('🔄 Resetting quiz to initial state');
      
      setCurrentQuestion(0);
      setAnswers({});
      setQuizResult(null);
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
      setShowEndQuizConfirm(false);
      setQuizState('start');
      
      if (quiz.timeLimit) {
        setTimeRemaining(quiz.timeLimit);
      } else {
        setTimeRemaining(null);
      }
      
      loadQuestionReactions();
    }
  }, [isOpen, quiz?.id]);

  // Debug quiz data when it loads
  useEffect(() => {
    if (quiz && quiz.questions) {
      console.log('🔍 Quiz loaded:', {
        quizId: quiz.id,
        title: quiz.title,
        questionCount: quiz.questions.length,
        sampleQuestion: quiz.questions[0] ? {
          id: quiz.questions[0].id,
          type: quiz.questions[0].type,
          question: quiz.questions[0].question,
          hasOptions: !!quiz.questions[0].options,
          optionsCount: quiz.questions[0].options?.length,
          firstOptionText: quiz.questions[0].options?.[0]?.optionText || quiz.questions[0].options?.[0]?.text
        } : null
      });
    }
  }, [quiz?.id]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || quizState !== 'taking' || timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, quizState, timeRemaining]);

  const loadQuestionReactions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !quiz) return;

      const response = await fetch(`/api/quizzes/${quiz.id}/reactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data)) {
          const reactionsMap = {};
          data.data.forEach(q => {
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

      const currentReaction = questionReactions[questionId];
      const newReactions = { ...questionReactions };
      
      if (currentReaction && currentReaction.isLike === isLike) {
        delete newReactions[questionId];
      } else {
        newReactions[questionId] = { isLike };
      }
      
      setQuestionReactions(newReactions);

      const response = await fetch(`/api/quiz-questions/${questionId}/reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isLike })
      });

      if (!response.ok) {
        setQuestionReactions(questionReactions);
        console.error('Failed to toggle reaction');
      }
    } catch (error) {
      setQuestionReactions(questionReactions);
      console.error('Error toggling reaction:', error);
    }
  };

  const handleStartQuiz = () => {
    console.log('▶️ Starting quiz...');
    setQuizState('taking');
  };

  const handleEndQuizEarly = () => {
    setShowEndQuizConfirm(true);
  };

  const confirmEndQuizEarly = () => {
    console.log('🚫 Ending quiz early');
    setShowEndQuizConfirm(false);
    setQuizState('start');
    setAnswers({});
    setCurrentQuestion(0);
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
    console.log('📤 Submitting quiz...');
    
    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => {
      const question = quiz.questions.find(q => q.id === parseInt(questionId));
      
      if (!question) return null;

      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
        return {
          questionId: parseInt(questionId),
          selectedOptionId: answer
        };
      } else if (question.type === 'MULTIPLE_ANSWER') {
        return {
          questionId: parseInt(questionId),
          selectedOptionId: answer
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
      const result = await onSubmit({
        quizId: quiz.id,
        answers: formattedAnswers,
        timeSpent
      });
      
      console.log('✅ Quiz submitted successfully:', result);
      
      if (result) {
        setQuizResult(result);
        setQuizState('results');
        setShowConfirmSubmit(false);
        setIsSubmitting(false);
      } else {
        console.error('❌ No result returned');
        setIsSubmitting(false);
        alert('Failed to get quiz results. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error submitting quiz:', error);
      setIsSubmitting(false);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const handleCloseResults = async (passed) => {
    console.log('🏁 Closing results and completing quiz flow...');
    
    // STEP 1: Force close ALL lesson modals immediately
    const lessonModals = document.querySelectorAll('[data-modal-type="lesson"]');
    lessonModals.forEach(backdrop => {
      const closeButton = backdrop.querySelector('[aria-label="Close modal"]');
      if (closeButton) {
        console.log('🚫 Force closing lesson modal');
        closeButton.click();
      }
    });
    
    // STEP 2: Close this quiz modal
    onClose();
    
    // STEP 3: Clean up quiz state
    setQuizResult(null);
    setQuizState('start');
    setAnswers({});
    setCurrentQuestion(0);
    
    // STEP 4: Call parent completion callback AFTER everything is closed
    if (onQuizComplete) {
      console.log('📢 Calling onQuizComplete with passed:', passed);
      // Use setTimeout to ensure modals are fully unmounted first
      setTimeout(async () => {
        await onQuizComplete(passed);
      }, 100);
    }
  };

  const handleRetakeQuiz = () => {
    console.log('🔄 Retaking quiz...');
    setQuizResult(null);
    setQuizState('start');
    setCurrentQuestion(0);
    setAnswers({});
    setQuestionReactions({});
    
    if (quiz.timeLimit) {
      setTimeRemaining(quiz.timeLimit);
    }
    
    loadQuestionReactions();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't render if not open or no quiz
  if (!isOpen || !quiz) return null;

  // Show results modal (highest priority - can't be interrupted)
  if (quizState === 'results' && quizResult) {
    console.log('📊 Displaying results screen');
    return (
      <QuizResultsModal
        result={quizResult}
        quiz={quiz}
        onContinue={handleCloseResults}
        onRetake={handleRetakeQuiz}
      />
    );
  }

  const currentQuestionData = quiz.questions?.[currentQuestion];
  const totalQuestions = quiz.questions?.length || 0;
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  // Show start screen
  if (quizState === 'start') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={onClose}>
        <div className="relative w-full max-w-6xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <QuizStartScreen
            quiz={quiz}
            onStart={handleStartQuiz}
            onClose={onClose}
          />
        </div>
      </div>
    );
  }

  // Show quiz taking screen
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
            confirmEndQuizEarly();
          }
        }
      }}
    >
      <div
        className="relative w-full max-w-6xl h-[95vh] lg:h-[90vh] bg-white dark:bg-neutral-900 rounded-lg lg:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
          <div className="h-2 bg-neutral-200 dark:bg-neutral-700">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="px-3 lg:px-8 py-3 lg:py-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 lg:gap-4">
            <div className="flex items-center gap-2 lg:gap-4 w-full lg:w-auto">
              <h2 className="text-base lg:text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex-1 lg:flex-initial">
                {quiz.title}
              </h2>
              <span className="px-2 lg:px-4 py-1 lg:py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full text-xs lg:text-sm font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                {currentQuestion + 1} / {totalQuestions}
              </span>
            </div>

            <div className="flex items-center gap-2 lg:gap-4 w-full lg:w-auto justify-between lg:justify-end">
              {timeRemaining !== null && (
                <div className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-5 py-1.5 lg:py-2.5 rounded-lg font-mono font-semibold text-sm lg:text-lg ${
                  timeRemaining < 60 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}>
                  <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatTime(timeRemaining)}
                </div>
              )}

              <div className="text-xs lg:text-base text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">
                {answeredCount} / {totalQuestions}
              </div>

              <button
                onClick={handleEndQuizEarly}
                className="px-2 lg:px-5 py-1.5 lg:py-2.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg font-semibold text-xs lg:text-base transition-all flex items-center gap-1 lg:gap-2"
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="hidden sm:inline">End Quiz</span>
                <span className="sm:hidden">End</span>
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
                {/* Media Section */}
                {(currentQuestionData.imageMime || currentQuestionData.videoPath) && (
                  <div className="flex-shrink-0 max-h-[35vh] lg:h-1/2 bg-neutral-900 dark:bg-neutral-950 flex items-center justify-center p-3 lg:p-6">
                    {currentQuestionData.imageMime && (
                      <div className="w-full h-full flex items-center justify-center">
                        {imageError === currentQuestion ? (
                          <div className="text-center p-4 lg:p-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 lg:w-24 lg:h-24 bg-red-100 dark:bg-red-900/20 rounded-full mb-2 lg:mb-4">
                              <svg className="w-8 h-8 lg:w-12 lg:h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <h3 className="text-base lg:text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
                              Image Not Available
                            </h3>
                          </div>
                        ) : (
                          <img
                            src={`/api/quizzes/questions/${currentQuestionData.id}/image`}
                            alt="Question"
                            className="max-w-full max-h-full object-contain rounded-lg lg:rounded-xl shadow-2xl"
                            onError={() => setImageError(currentQuestion)}
                            onLoad={() => setImageError(null)}
                          />
                        )}
                      </div>
                    )}

                    {currentQuestionData.videoPath && !currentQuestionData.imageMime && (
                      <div className="w-full h-full flex items-center justify-center">
                        <video
                          key={currentQuestion}
                          className="max-w-full max-h-full object-contain rounded-lg lg:rounded-xl shadow-2xl"
                          controls
                          autoPlay
                          loop
                          playsInline
                          src={`/api/quizzes/questions/${currentQuestionData.id}/video`}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>
                )}

                {/* Question and Options Section */}
                <div className={`flex-1 min-h-0 overflow-y-auto px-3 lg:px-8 py-3 lg:py-6 space-y-3 lg:space-y-6 ${
                  currentQuestionData.imageMime || currentQuestionData.videoPath 
                    ? 'bg-neutral-50 dark:bg-neutral-900' 
                    : 'bg-white dark:bg-neutral-900 max-w-5xl mx-auto w-full'
                }`}>
                  {/* Question Text */}
                  {(currentQuestionData.imageMime || currentQuestionData.videoPath) ? (
                    <div className="px-4 lg:px-6 py-3 lg:py-5 bg-white dark:bg-neutral-800 rounded-lg lg:rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
                      <div className="flex items-start gap-2 lg:gap-4">
                        <div className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm lg:text-lg">
                          {currentQuestion + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base lg:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2 lg:mb-3">
                            {currentQuestionData.question}
                          </h3>
                          <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                            {currentQuestionData.points && (
                              <span className="inline-block px-2 lg:px-3 py-1 lg:py-1.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded text-xs lg:text-sm font-medium">
                                {currentQuestionData.points} {currentQuestionData.points === 1 ? 'pt' : 'pts'}
                              </span>
                            )}
                            
                            <div className="flex items-center gap-1 lg:gap-2">
                              <button
                                onClick={() => handleReactionToggle(currentQuestionData.id, true)}
                                className={`flex items-center gap-1 lg:gap-1.5 px-2 lg:px-3 py-1 lg:py-1.5 rounded transition-all ${
                                  questionReactions[currentQuestionData.id]?.isLike === true
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-green-50'
                                }`}
                              >
                                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleReactionToggle(currentQuestionData.id, false)}
                                className={`flex items-center gap-1 lg:gap-1.5 px-2 lg:px-3 py-1 lg:py-1.5 rounded transition-all ${
                                  questionReactions[currentQuestionData.id]?.isLike === false
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-red-50'
                                }`}
                              >
                                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 lg:p-8 bg-white dark:bg-neutral-800 rounded-lg lg:rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center gap-2 lg:gap-4 mb-3 lg:mb-4">
                        <div className="flex-shrink-0 w-8 h-8 lg:w-12 lg:h-12 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-base lg:text-xl">
                          {currentQuestion + 1}
                        </div>
                        <h3 className="flex-1 text-base lg:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                          {currentQuestionData.question}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                        {currentQuestionData.points && (
                          <span className="inline-block px-2 lg:px-4 py-1 lg:py-2 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-full text-xs lg:text-base font-medium">
                            {currentQuestionData.points} {currentQuestionData.points === 1 ? 'pt' : 'pts'}
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReactionToggle(currentQuestionData.id, true)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                              questionReactions[currentQuestionData.id]?.isLike === true
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-green-50'
                            }`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleReactionToggle(currentQuestionData.id, false)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                              questionReactions[currentQuestionData.id]?.isLike === false
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                : 'bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-red-50'
                            }`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Answer Options */}
                  <div className="space-y-2 lg:space-y-4">
                    {!currentQuestionData.options || currentQuestionData.options.length === 0 ? (
                      <div className="p-4 lg:p-8 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg lg:rounded-xl text-center">
                        <svg className="w-12 h-12 lg:w-16 lg:h-16 text-red-600 dark:text-red-400 mx-auto mb-2 lg:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-base lg:text-xl font-bold text-red-900 dark:text-red-100 mb-2">No Answer Options Available</h3>
                        <p className="text-sm lg:text-base text-red-700 dark:text-red-300">This question doesn't have answer options configured. Please contact your instructor.</p>
                      </div>
                    ) : currentQuestionData.type === 'MULTIPLE_CHOICE' || currentQuestionData.type === 'TRUE_FALSE' ? (
                      currentQuestionData.options?.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleAnswerChange(currentQuestionData.id, option.id)}
                          className={`w-full p-3 lg:p-5 text-left rounded-lg lg:rounded-xl border-2 transition-all shadow-sm hover:shadow-md ${
                            answers[currentQuestionData.id] === option.id
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/20 dark:border-brand-400'
                              : 'border-neutral-200 dark:border-neutral-600 hover:border-brand-300 dark:hover:border-brand-600 bg-white dark:bg-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 lg:gap-4">
                            <div className={`flex-shrink-0 w-5 h-5 lg:w-7 lg:h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                              answers[currentQuestionData.id] === option.id
                                ? 'border-brand-500 bg-brand-500 dark:border-brand-400 dark:bg-brand-400'
                                : 'border-neutral-400 dark:border-neutral-500'
                            }`}>
                              {answers[currentQuestionData.id] === option.id && (
                                <svg className="w-3 h-3 lg:w-4 lg:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className="flex-1 text-sm lg:text-lg font-semibold text-neutral-900 dark:text-white">
                              {option.optionText || option.text}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : currentQuestionData.type === 'MULTIPLE_ANSWER' ? (
                      currentQuestionData.options?.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleMultipleAnswerToggle(currentQuestionData.id, option.id)}
                          className={`w-full p-3 lg:p-5 text-left rounded-lg lg:rounded-xl border-2 transition-all shadow-sm hover:shadow-md ${
                            (answers[currentQuestionData.id] || []).includes(option.id)
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/20 dark:border-brand-400'
                              : 'border-neutral-200 dark:border-neutral-600 hover:border-brand-300 dark:hover:border-brand-600 bg-white dark:bg-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 lg:gap-4">
                            <div className={`flex-shrink-0 w-5 h-5 lg:w-7 lg:h-7 rounded border-2 flex items-center justify-center transition-all ${
                              (answers[currentQuestionData.id] || []).includes(option.id)
                                ? 'border-brand-500 bg-brand-500 dark:border-brand-400 dark:bg-brand-400'
                                : 'border-neutral-400 dark:border-neutral-500'
                            }`}>
                              {(answers[currentQuestionData.id] || []).includes(option.id) && (
                                <svg className="w-3 h-3 lg:w-4 lg:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className="flex-1 text-sm lg:text-lg font-semibold text-neutral-900 dark:text-white">
                              {option.optionText || option.text}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <textarea
                        value={answers[currentQuestionData.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestionData.id, e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full p-5 text-lg border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 resize-none min-h-[150px] shadow-sm"
                        rows={5}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex-shrink-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 px-3 lg:px-8 py-3 lg:py-5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-0">
            {/* Question Navigation Dots - Show first on mobile */}
            <div className="order-2 lg:order-2 w-full lg:w-auto flex items-center justify-center gap-2 max-w-full lg:max-w-md">
              <div className="flex items-center gap-1.5 lg:gap-2 overflow-x-auto px-2 lg:px-4 scrollbar-hide">
                {quiz.questions?.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`flex-shrink-0 w-7 h-7 lg:w-10 lg:h-10 rounded-full text-xs lg:text-base font-semibold transition-all ${
                      index === currentQuestion
                        ? 'bg-brand-600 text-white scale-110'
                        : answers[quiz.questions[index].id]
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                    }`}
                    disabled={isAnimating}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="order-1 lg:order-1 w-full lg:w-auto flex items-center justify-between gap-2">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0 || isAnimating}
                className="px-3 lg:px-6 py-2 lg:py-3 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg font-semibold text-sm lg:text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 lg:gap-2"
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>

              {isLastQuestion ? (
                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  disabled={isAnimating}
                  className="px-4 lg:px-8 py-2 lg:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm lg:text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 lg:gap-2"
                >
                  <span className="hidden sm:inline">Submit Quiz</span>
                  <span className="sm:hidden">Submit</span>
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  disabled={isAnimating}
                  className="px-4 lg:px-8 py-2 lg:py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold text-sm lg:text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 lg:gap-2"
                >
                  Next
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl p-10 max-w-md mx-4">
              <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Submit Quiz?
              </h3>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2">
                You have answered {answeredCount} out of {totalQuestions} questions.
              </p>
              {answeredCount < totalQuestions && (
                <p className="text-amber-600 dark:text-amber-400 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  {totalQuestions - answeredCount} question(s) not answered will be marked as incorrect.
                </p>
              )}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 px-6 py-3 text-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 text-lg bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* End Quiz Early Confirmation */}
        {showEndQuizConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl p-10 max-w-md mx-4">
              <div className="flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 text-center">
                End Quiz Early?
              </h3>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2 text-center">
                Are you sure you want to exit this quiz?
              </p>
              <p className="text-red-600 dark:text-red-400 mb-8 text-center font-medium">
                Your progress will be lost and won't be submitted.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowEndQuizConfirm(false)}
                  className="flex-1 px-6 py-3 text-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEndQuizEarly}
                  className="flex-1 px-6 py-3 text-lg bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                >
                  End Quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
