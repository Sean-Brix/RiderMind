import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import QuizModal from './QuizModalNew';
import { submitQuizAttempt, recordQuizAttempt, completeModule } from '../services/studentModuleService';
import './Lesson/LessonModal.css';

/**
 * LessonModal - Dynamic component for displaying module lessons with slides
 * 
 * Features:
 * - Supports multiple slide types: video, image, text
 * - Right sidebar with lesson details
 * - Navigation: next/prev buttons, keyboard arrows, page indicators
 * - Quiz integration after slides
 * - Progress tracking and module completion
 * - Smooth animations: modal open/close, slide transitions
 * - Responsive design
 */
export default function LessonModal({ isOpen, onClose, lesson }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState('next'); // 'next' or 'prev' for animation
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('lesson'); // 'lesson' or 'feedbacks'
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
  const [myFeedback, setMyFeedback] = useState(null);
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);

  // Reset to appropriate slide when modal opens
  useEffect(() => {
    if (isOpen) {
      // Check if we should skip directly to quiz
      if (lesson?.skipToQuiz && lesson?.quiz) {
        setShowQuiz(true);
        setCurrentSlide(0);
      } else if (lesson?.startAtQuiz && lesson?.quiz) {
        setShowQuiz(true);
        setCurrentSlide(0);
      } else {
        setShowQuiz(false);
        // Resume from last viewed slide if available
        const startSlideIndex = lesson?.currentSlideIndex ?? 0;
        setCurrentSlide(startSlideIndex);
      }
      
      setDirection('next');
      setImageError(null);
      setQuizCompleted(false);
      setSidebarTab('lesson');
      setFeedbackText('');
      setFeedbackRating(0);
      setIsEditingFeedback(false);
    }
  }, [isOpen, lesson]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (e.key === 'ArrowRight') {
        handleNextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSlide, lesson]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Load feedbacks when Feedbacks tab is opened
  useEffect(() => {
    if (sidebarTab === 'feedbacks' && lesson?.moduleId) {
      loadFeedbacks();
    }
  }, [sidebarTab, lesson?.moduleId]);

  const loadFeedbacks = async () => {
    if (!lesson?.moduleId) return;
    
    setIsLoadingFeedbacks(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch feedbacks and stats in parallel
      const [feedbacksRes, statsRes] = await Promise.all([
        fetch(`/api/modules/${lesson.moduleId}/feedback?page=1&limit=20&sortBy=createdAt&order=desc`),
        fetch(`/api/modules/${lesson.moduleId}/feedback/stats`)
      ]);

      if (feedbacksRes.ok) {
        const feedbacksData = await feedbacksRes.json();
        if (feedbacksData.success) {
          setFeedbacks(feedbacksData.data.feedbacks || []);
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setFeedbackStats(statsData.data);
        }
      }

      // Try to fetch user's own feedback (requires authentication)
      if (token) {
        try {
          const myFeedbackRes = await fetch(`/api/modules/${lesson.moduleId}/feedback/my`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (myFeedbackRes.ok) {
            const myFeedbackData = await myFeedbackRes.json();
            if (myFeedbackData.success && myFeedbackData.data) {
              setMyFeedback(myFeedbackData.data);
              setFeedbackRating(myFeedbackData.data.rating);
              setFeedbackText(myFeedbackData.data.comment);
            }
          }
        } catch (error) {
          // User not authenticated or no feedback yet - that's fine
        }
      }
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  const handleNextSlide = () => {
    if (isAnimating || !lesson?.slides) return;
    if (currentSlide < lesson.slides.length - 1) {
      setDirection('next');
      setIsAnimating(true);
      setImageError(null); // Reset error when changing slides
      setTimeout(() => {
        const nextSlide = currentSlide + 1;
        setCurrentSlide(nextSlide);
        setIsAnimating(false);
        
        // Update progress - cap at 90% until quiz is passed
        if (lesson.onProgressUpdate && lesson.moduleId && lesson.slides[nextSlide]) {
          const slideProgress = ((nextSlide + 1) / lesson.slides.length) * 100;
          // Cap progress at 90% - the remaining 10% comes from passing the quiz
          const progressPercent = Math.min(90, Math.round(slideProgress));
          lesson.onProgressUpdate(lesson.moduleId, lesson.slides[nextSlide].id, progressPercent);
        }
      }, 300);
    }
  };

  const handlePrevSlide = () => {
    if (isAnimating || !lesson?.slides) return;
    if (currentSlide > 0) {
      setDirection('prev');
      setIsAnimating(true);
      setImageError(null); // Reset error when changing slides
      setTimeout(() => {
        setCurrentSlide((prev) => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const goToSlide = (index) => {
    if (isAnimating || index === currentSlide || !lesson?.slides) return;
    setDirection(index > currentSlide ? 'next' : 'prev');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsAnimating(false);
      
      // Update progress when jumping to a slide - cap at 90% until quiz is passed
      if (lesson.onProgressUpdate && lesson.moduleId && lesson.slides[index]) {
        const slideProgress = ((index + 1) / lesson.slides.length) * 100;
        // Cap progress at 90% - the remaining 10% comes from passing the quiz
        const progressPercent = Math.min(90, Math.round(slideProgress));
        lesson.onProgressUpdate(lesson.moduleId, lesson.slides[index].id, progressPercent);
      }
    }, 300);
  };

  const handleMarkAsDone = async () => {
    if (!lesson?.quiz) {
      // No quiz, just close
      onClose();
      return;
    }
    
    // Show quiz
    setShowQuiz(true);
  };

  const handleQuizSubmit = async (quizData) => {
    try {
      setIsCompleting(true);
      
      // Submit to backend for scoring
      const result = await submitQuizAttempt(lesson.moduleId, {
        categoryId: lesson.categoryId,
        quizId: lesson.quiz.id,
        answers: quizData.answers,
        timeSpent: quizData.timeSpent || 0
      });
      
      if (result.success) {
        // Return the result so QuizModal can display it
        setIsCompleting(false);
        return result.data;
      }
      
      setIsCompleting(false);
      return null;
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setIsCompleting(false);
      throw error; // Let QuizModal handle the error
    }
  };

  const handleQuizComplete = async (quizResult) => {
    try {
      setIsCompleting(true);
      
      console.log('📝 handleQuizComplete called with:', {
        quizResult,
        moduleId: lesson.moduleId,
        categoryId: lesson.categoryId,
        studentModuleId: lesson.studentModuleId
      });
      
      // Record quiz attempt - using moduleId from lesson
      if (lesson.moduleId && lesson.categoryId && quizResult) {
        const quizData = {
          categoryId: lesson.categoryId,
          quizScore: quizResult.score || 0,
          quizAttemptId: quizResult.attemptId || quizResult.id || null,
          passed: quizResult.passed || false
        };
        
        console.log('📤 Recording quiz attempt with data:', quizData);
        
        await recordQuizAttempt(lesson.moduleId, quizData);
        
        // If passed, complete the module
        if (quizResult.passed) {
          console.log('✅ Quiz passed, completing module');
          await completeModule(lesson.moduleId, {
            categoryId: lesson.categoryId,
            quizScore: quizResult.score || 0,
            quizAttemptId: quizResult.attemptId || quizResult.id || null
          });
        }
      }
      
      setQuizCompleted(true);
      setShowQuiz(false);
      
      // Close the lesson modal immediately
      onClose();
      
      // Call the parent's quiz complete handler after closing
      // QuizModal will handle this with a delay to ensure modals are closed first
      if (lesson.onQuizComplete) {
        await lesson.onQuizComplete(quizResult);
      }
    } catch (error) {
      console.error('Error completing quiz:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      alert('Failed to save quiz results. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim() || feedbackRating === 0) {
      alert('Please provide both a rating and feedback comment.');
      return;
    }

    if (feedbackText.trim().length < 10) {
      alert('Please provide at least 10 characters in your feedback.');
      return;
    }

    if (feedbackText.length > 1000) {
      alert('Feedback must not exceed 1000 characters.');
      return;
    }

    if (!lesson?.moduleId) {
      alert('Module ID not found');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to submit feedback.');
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      const response = await fetch(`/api/modules/${lesson.moduleId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: feedbackRating,
          comment: feedbackText.trim(),
          isLike: feedbackRating >= 4
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(myFeedback ? 'Feedback updated successfully!' : 'Thank you for your feedback!');
        setFeedbackText('');
        setFeedbackRating(0);
        setMyFeedback(data.data);
        setIsEditingFeedback(false); // Close edit mode after submit
        // Reload feedbacks to show updated list
        loadFeedbacks();
      } else {
        alert(data.message || 'Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (!isOpen || !lesson) return null;

  const currentSlideData = lesson.slides?.[currentSlide];
  const totalSlides = lesson.slides?.length || 0;
  const progress = totalSlides > 0 ? ((currentSlide + 1) / totalSlides) * 100 : 0;
  
  // If we're showing quiz or quiz results, hide the main lesson modal
  const hideMainModal = (showQuiz || quizResult) && totalSlides === 0;

  return (
    <div
      data-modal-type="lesson"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
      onClick={onClose}
    >
      {/* Modal Container - Hide when showing quiz/results with no slides */}
      {!hideMainModal && (
        <div
          className={`relative w-full max-w-[95vw] h-[92vh] bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-700 ease-out ${
            isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8'
          }`}
          style={{
            border: '1px solid rgba(var(--brand-rgb, 59, 130, 246), 0.2)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 z-20 p-3 bg-white/95 dark:bg-neutral-800/95 hover:bg-white dark:hover:bg-neutral-800 rounded-xl shadow-xl transition-all hover:scale-110 hover:rotate-90 duration-300 group backdrop-blur-sm border border-neutral-200 dark:border-neutral-700"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6 text-neutral-700 dark:text-neutral-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden">
          {/* Left Side - Slide Content (70% on desktop, full width on mobile) */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 relative min-h-[50vh] lg:min-h-0">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-neutral-200 dark:bg-neutral-700 z-10">
              <div
                className="h-full bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 transition-all duration-500 ease-out shadow-lg shadow-brand-500/50"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Slide Header */}
            <div className="pt-6 lg:pt-10 px-4 lg:px-8 pb-3 lg:pb-5 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-700 dark:from-brand-400 dark:to-brand-500 mb-2">
                {lesson.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                <span className="inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-brand-100 dark:bg-brand-900/30 rounded-full text-xs lg:text-sm font-bold text-brand-700 dark:text-brand-300">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Slide {currentSlide + 1} / {totalSlides}
                </span>
                <span className="text-xs lg:text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                  {Math.round(progress)}% Complete
                </span>
              </div>
            </div>

            {/* Slide Content with Animation */}
            <>
            <div className="flex-1 relative overflow-hidden">
              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-brand-500/10 to-transparent rounded-br-[100px] pointer-events-none z-10" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-brand-500/10 to-transparent rounded-tl-[100px] pointer-events-none z-10" />
              
              <div
                className={`absolute inset-0 transition-all duration-700 ease-out ${
                  isAnimating
                    ? direction === 'next'
                      ? '-translate-x-full opacity-0 scale-95'
                      : 'translate-x-full opacity-0 scale-95'
                    : 'translate-x-0 opacity-100 scale-100'
                }`}
              >
                {currentSlideData && (
                  <div className="h-full flex items-center justify-center p-4 lg:p-8">
                    {/* Video Slide */}
                    {currentSlideData.type === 'video' && (
                      <div className="w-full h-full flex items-center justify-center animate-fadeIn">
                        <video
                          key={currentSlide}
                          className="w-full h-full max-h-[40vh] lg:max-h-full object-contain rounded-lg lg:rounded-2xl shadow-2xl ring-2 lg:ring-4 ring-brand-500/20 hover:ring-brand-500/40 transition-all"
                          controls
                          autoPlay
                          src={currentSlideData.content}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}

                    {/* Image Slide */}
                    {currentSlideData.type === 'image' && (
                      <div className="w-full h-full flex items-center justify-center animate-fadeIn">
                        {imageError === currentSlide ? (
                          <div className="text-center p-6 lg:p-12 animate-fadeIn">
                            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl mb-6 shadow-xl">
                              <svg className="w-16 h-16 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-3">
                              Image Not Available
                            </h3>
                            <p className="text-red-700 dark:text-red-300 mb-4 text-lg">
                              This slide&apos;s image could not be loaded.
                            </p>
                          </div>
                        ) : (
                          <img
                            src={currentSlideData.content}
                            alt={currentSlideData.title}
                            className="w-full h-full max-h-[40vh] lg:max-h-full object-contain rounded-lg lg:rounded-2xl shadow-2xl ring-2 lg:ring-4 ring-brand-500/20 hover:ring-brand-500/40 transition-all hover:scale-[1.01] lg:hover:scale-[1.02] duration-300"
                            onError={(e) => {
                              console.error('Image failed to load:', {
                                src: currentSlideData.content,
                                title: currentSlideData.title,
                                slideIndex: currentSlide,
                                error: e,
                                naturalWidth: e.target.naturalWidth,
                                naturalHeight: e.target.naturalHeight,
                                complete: e.target.complete,
                                currentSrc: e.target.currentSrc
                              });
                              // Log the actual HTTP request details
                              console.error('Image element details:', e.target);
                              setImageError(currentSlide);
                            }}
                            onLoad={(e) => {
                              setImageError(null);
                            }}
                          />
                        )}
                      </div>
                    )}

                    {/* Text Content Slide */}
                    {currentSlideData.type === 'text' && (
                      <div className="w-full h-full flex items-center justify-center p-4 lg:p-12 animate-fadeIn">
                        <div className="max-w-4xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-xl lg:rounded-3xl shadow-2xl p-6 lg:p-12 border border-neutral-200 dark:border-neutral-700">
                          <h3 className="text-2xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-700 dark:from-brand-400 dark:to-brand-500 mb-4 lg:mb-8">
                            {currentSlideData.title}
                          </h3>
                          <div className="prose prose-sm lg:prose-xl dark:prose-invert max-w-none">
                            <p className="text-base lg:text-2xl text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                              {currentSlideData.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Controls - Only show when viewing slides */}
            <div className="p-4 lg:p-8 bg-gradient-to-t from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-6">
                {/* Page Indicators - Show centered on mobile */}
                <div className="flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2 lg:py-3 bg-white dark:bg-neutral-800 rounded-lg lg:rounded-xl shadow-lg border-2 border-neutral-200 dark:border-neutral-700 order-2 lg:order-2">
                  {lesson.slides?.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      disabled={isAnimating}
                      className={`transition-all duration-500 rounded-full ${
                        index === currentSlide
                          ? 'w-8 lg:w-12 h-3 lg:h-4 bg-gradient-to-r from-brand-500 to-brand-600 shadow-lg shadow-brand-500/50'
                          : 'w-3 lg:w-4 h-3 lg:h-4 bg-neutral-300 dark:bg-neutral-600 hover:bg-brand-400 hover:scale-110'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between w-full lg:w-auto gap-2 lg:gap-6 order-1 lg:order-1">
                  {/* Previous Button */}
                  <button
                    onClick={handlePrevSlide}
                    disabled={currentSlide === 0 || isAnimating}
                    className="group px-4 lg:px-8 py-3 lg:py-4 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg lg:rounded-xl font-bold text-sm lg:text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 lg:gap-3 shadow-lg hover:shadow-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-brand-300 dark:hover:border-brand-600 disabled:hover:border-neutral-200 dark:disabled:hover:border-neutral-700"
                  >
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>

                  {/* Next Button or Mark as Done */}
                  {currentSlide === totalSlides - 1 ? (
                    <button 
                      onClick={handleMarkAsDone}
                      disabled={isCompleting || isAnimating}
                      className="group px-4 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg lg:rounded-xl font-bold text-sm lg:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 lg:gap-3 shadow-xl hover:shadow-2xl hover:scale-105 transform"
                    >
                      <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="hidden sm:inline">{lesson.quiz ? 'Take Quiz' : 'Mark as Done'}</span>
                      <span className="sm:hidden">{lesson.quiz ? 'Quiz' : 'Done'}</span>
                      {isCompleting && (
                        <svg className="animate-spin w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleNextSlide}
                      disabled={isAnimating}
                      className="group px-4 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-lg lg:rounded-xl font-bold text-sm lg:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 lg:gap-3 shadow-xl hover:shadow-2xl hover:scale-105 transform"
                    >
                      <span>Next</span>
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
            </>
          </div>

          {/* Right Sidebar - Lesson Details (30% on desktop, full width on mobile) */}
          <div className="w-full lg:w-96 bg-white dark:bg-neutral-900 lg:border-l border-t lg:border-t-0 border-neutral-200 dark:border-neutral-700 overflow-y-auto flex flex-col">
            {/* Tabs */}
            <div className="border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 sticky top-0 z-10">
              <div className="flex">
                <button
                  onClick={() => setSidebarTab('lesson')}
                  className={`flex-1 px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-semibold transition-colors border-b-2 ${
                    sidebarTab === 'lesson'
                      ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 lg:gap-2">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Lesson
                  </div>
                </button>
                <button
                  onClick={() => setSidebarTab('feedbacks')}
                  className={`flex-1 px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-semibold transition-colors border-b-2 ${
                    sidebarTab === 'feedbacks'
                      ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 lg:gap-2">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Feedbacks
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {sidebarTab === 'lesson' ? (
                /* Lesson Tab Content */
                <div className="p-4 lg:p-6">
                  {/* Lesson Info */}
                  <div className="mb-4 lg:mb-6">
                    <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 mb-2">
                      <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <span className="font-semibold text-xs lg:text-sm">Module {lesson.moduleId}</span>
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 lg:mb-3">
                      {lesson.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-xs lg:text-sm leading-relaxed">
                      {lesson.description}
                    </p>
                  </div>

                  {/* Current Slide Details */}
                  {currentSlideData && (
                    <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800">
                      <h4 className="font-semibold text-sm lg:text-base text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-2">
                        <svg className="w-3 h-3 lg:w-4 lg:h-4 text-brand-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                        Current Slide
                      </h4>
                      <p className="text-xs lg:text-sm text-neutral-700 dark:text-neutral-300">
                        {currentSlideData.description || currentSlideData.title}
                      </p>
                    </div>
                  )}

                  {/* Learning Objectives */}
                  {lesson.objectives && lesson.objectives.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Learning Objectives
                      </h4>
                      <ul className="space-y-2">
                        {lesson.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                            <span className="text-brand-600 mt-1">•</span>
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Slide Overview */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                      All Slides ({totalSlides})
                    </h4>
                    <div className="space-y-2">
                      {lesson.slides?.map((slide, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          disabled={isAnimating}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            index === currentSlide
                              ? 'bg-brand-100 dark:bg-brand-900/30 border-2 border-brand-600'
                              : 'bg-neutral-100 dark:bg-neutral-800 border-2 border-transparent hover:border-brand-300 dark:hover:border-brand-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                                index === currentSlide
                                  ? 'bg-brand-600 text-white'
                                  : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                {slide.title}
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                                {slide.type}
                              </div>
                            </div>
                            {index === currentSlide && (
                              <svg className="w-5 h-5 text-brand-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Resources */}
                  {lesson.resources && lesson.resources.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        Resources
                      </h4>
                      <div className="space-y-2">
                        {lesson.resources.map((resource, index) => (
                          <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                          >
                            <div className="text-sm font-medium text-brand-600 dark:text-brand-400">
                              {resource.title}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">{resource.type}</div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Feedbacks Tab Content */
                <div className="p-6">
                  {/* My Feedback - Show at top if exists */}
                  {myFeedback && !isEditingFeedback && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Your Feedback
                        </h4>
                        <button
                          onClick={() => {
                            setIsEditingFeedback(true);
                            setFeedbackRating(myFeedback.rating);
                            setFeedbackText(myFeedback.comment);
                          }}
                          className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg 
                            key={star} 
                            className={`w-4 h-4 ${star <= myFeedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300 dark:text-neutral-600'}`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">
                        {myFeedback.comment}
                      </p>
                    </div>
                  )}

                  {/* Submit/Edit Feedback Section */}
                  {(!myFeedback || isEditingFeedback) && (
                    <div className="mb-6 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {isEditingFeedback ? 'Edit Feedback' : 'Submit Feedback'}
                        </h4>
                        {isEditingFeedback && (
                          <button
                            onClick={() => {
                              setIsEditingFeedback(false);
                              setFeedbackText('');
                              setFeedbackRating(0);
                            }}
                            className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      
                      {/* Compact Rating Stars */}
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setFeedbackRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <svg
                              className={`w-6 h-6 ${
                                star <= feedbackRating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-neutral-300 dark:text-neutral-600'
                              }`}
                              fill={star <= feedbackRating ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                        ))}
                      </div>

                      {/* Compact Comment Input */}
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Share your thoughts..."
                        rows={3}
                        className="w-full px-2 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none mb-2"
                      />

                      {/* Submit Button */}
                      <button
                        onClick={handleSubmitFeedback}
                        disabled={isSubmittingFeedback || !feedbackText.trim() || feedbackRating === 0}
                        className="w-full px-3 py-2 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmittingFeedback ? (
                          <>
                            <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {isEditingFeedback ? 'Updating...' : 'Submitting...'}
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            {isEditingFeedback ? 'Update' : 'Submit'}
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Existing Feedbacks */}
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Student Feedbacks
                    </h4>

                    {/* Loading State */}
                    {isLoadingFeedbacks && (
                      <div className="flex items-center justify-center py-8">
                        <svg className="animate-spin w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}

                    {/* Overall Rating Summary */}
                    {!isLoadingFeedbacks && feedbackStats && (
                      <div className="mb-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Overall Rating</span>
                          <div className="flex items-center gap-1">
                            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                              {feedbackStats.averageRating > 0 ? feedbackStats.averageRating.toFixed(1) : 'N/A'}
                            </span>
                            {feedbackStats.averageRating > 0 && (
                              <svg className="w-6 h-6 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            <span>{feedbackStats.totalLikes} Likes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                            </svg>
                            <span>{feedbackStats.totalDislikes} Dislikes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <span>{feedbackStats.totalComments} Comments</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* No Feedbacks Message */}
                    {!isLoadingFeedbacks && feedbacks.length === 0 && (
                      <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <p className="text-sm">No feedback yet. Be the first to share your thoughts!</p>
                      </div>
                    )}

                    {/* Feedback List */}
                    {!isLoadingFeedbacks && feedbacks.length > 0 && (
                      <div className="space-y-3">
                        {feedbacks.map((feedback) => {
                          const userName = feedback.user 
                            ? `${feedback.user.first_name || ''} ${feedback.user.last_name || ''}`.trim() || feedback.user.email
                            : 'Anonymous';
                          const initials = userName
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2);
                          
                          // Format date
                          const feedbackDate = new Date(feedback.createdAt);
                          const now = new Date();
                          const diffTime = Math.abs(now - feedbackDate);
                          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                          const timeAgo = diffDays === 0 
                            ? 'Today' 
                            : diffDays === 1 
                            ? 'Yesterday' 
                            : `${diffDays} days ago`;

                          return (
                            <div key={feedback.id} className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                              <div className="flex items-start gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                  {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                                      {userName}
                                    </span>
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <svg 
                                          key={star} 
                                          className={`w-3 h-3 ${star <= feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300 dark:text-neutral-600'}`}
                                          viewBox="0 0 24 24"
                                        >
                                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                                    {feedback.comment}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                                    <span>{timeAgo}</span>
                                    <span className={`flex items-center gap-1 ${feedback.isLike ? 'text-green-600' : 'text-red-600'}`}>
                                      {feedback.isLike ? (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                        </svg>
                                      ) : (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                        </svg>
                                      )}
                                      {feedback.isLike ? 'Liked' : 'Disliked'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
      
      {/* Quiz Modal - Separate modal for quiz */}
      {lesson?.quiz && (
        <QuizModal
          isOpen={showQuiz}
          onClose={() => {
            console.log('🚪 QuizModal onClose called, hiding quiz');
            setShowQuiz(false);
          }}
          quiz={lesson.quiz}
          onSubmit={handleQuizSubmit}
          onQuizComplete={handleQuizComplete}
        />
      )}
    </div>
  );
}

LessonModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  lesson: PropTypes.shape({
    moduleId: PropTypes.number,
    studentModuleId: PropTypes.number,
    categoryId: PropTypes.number,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    objectives: PropTypes.arrayOf(PropTypes.string),
    slides: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        type: PropTypes.oneOf(['video', 'image', 'text']).isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        description: PropTypes.string,
      })
    ),
    quiz: PropTypes.object,
    startAtQuiz: PropTypes.bool,
    progress: PropTypes.number,
    onProgressUpdate: PropTypes.func,
    onQuizComplete: PropTypes.func,
    resources: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        type: PropTypes.string,
        url: PropTypes.string.isRequired,
      })
    ),
  }),
};
