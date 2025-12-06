import { useState, useEffect, useCallback } from 'react';
import { BaseModal } from '../Modals/BaseModal';
import { BaseTabs } from '../ui/BaseTabs';
import FeedbackUnified from '../FeedbackPanel/FeedbackUnified';

/**
 * LessonViewer - Lesson modal using Phase 3 architecture
 * Displays lesson slides with navigation and sidebar
 */
export function LessonViewer({ isOpen, onClose, lesson, initialSlide = 0, onSlideChange, onComplete, onStartQuiz }) {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [direction, setDirection] = useState('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageError, setImageError] = useState(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(initialSlide);
      setDirection('next');
      setImageError(null);
    }
  }, [isOpen, initialSlide]);

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

  const handleNextSlide = useCallback(() => {
    if (isAnimating || !lesson?.slides) return;
    
    const totalSlides = lesson.slides.length;
    if (currentSlide < totalSlides - 1) {
      setDirection('next');
      setIsAnimating(true);
      
      setTimeout(() => {
        const newIndex = currentSlide + 1;
        setCurrentSlide(newIndex);
        onSlideChange?.(newIndex);
        setIsAnimating(false);
      }, 350);
    }
  }, [currentSlide, isAnimating, lesson, onSlideChange]);

  const handlePrevSlide = useCallback(() => {
    if (isAnimating || currentSlide === 0) return;
    
    setDirection('prev');
    setIsAnimating(true);
    
    setTimeout(() => {
      const newIndex = currentSlide - 1;
      setCurrentSlide(newIndex);
      onSlideChange?.(newIndex);
      setIsAnimating(false);
    }, 350);
  }, [currentSlide, isAnimating, onSlideChange]);

  const goToSlide = useCallback((index) => {
    if (isAnimating || index === currentSlide || !lesson?.slides) return;
    
    setDirection(index > currentSlide ? 'next' : 'prev');
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentSlide(index);
      onSlideChange?.(index);
      setIsAnimating(false);
    }, 350);
  }, [currentSlide, isAnimating, lesson, onSlideChange]);

  const handleMarkAsDone = useCallback(() => {
    if (lesson?.id) {
      onComplete?.(lesson.id);
    }
    onClose();
  }, [lesson, onComplete, onClose]);

  const handleStartQuiz = useCallback(() => {
    if (onStartQuiz && lesson?.quiz) {
      // Close lesson modal and open quiz modal
      onClose();
      onStartQuiz(lesson.quiz, lesson.moduleId, lesson.studentModuleId);
    } else {
      console.warn('No quiz available or onStartQuiz callback not provided');
    }
  }, [lesson, onStartQuiz, onClose]);

  if (!isOpen || !lesson) return null;

  const currentSlideData = lesson.slides?.[currentSlide];
  const totalSlides = lesson.slides?.length || 0;
  const progress = totalSlides > 0 ? ((currentSlide + 1) / totalSlides) * 100 : 0;

  // Sidebar tabs configuration
  const tabs = [
    { 
      value: 'lesson', 
      label: 'Lesson', 
      icon: '📚',
      content: (
        <div className="h-full overflow-y-auto p-3 lg:p-4">
          {/* Lesson Info */}
          <div className="mb-3 lg:mb-4">
            <h3 className="text-base lg:text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1.5 lg:mb-2">
              {lesson.title}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
              {lesson.description}
            </p>
          </div>

          {/* Current Slide Details */}
          {currentSlideData && (
            <div className="mb-3 lg:mb-4 p-2.5 lg:p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800">
              <h4 className="font-semibold text-xs lg:text-sm text-neutral-900 dark:text-neutral-100 mb-1.5 flex items-center gap-2">
                <span className="text-brand-600 dark:text-brand-400">📍</span>
                Current Slide
              </h4>
              <p className="text-neutral-800 dark:text-neutral-200 font-medium text-xs mb-0.5">
                {currentSlideData.title}
              </p>
              <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                {currentSlideData.description}
              </p>
            </div>
          )}

          {/* Learning Objectives */}
          {lesson.objectives && lesson.objectives.length > 0 && (
            <div className="mb-3 lg:mb-4">
              <h4 className="text-xs lg:text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5 lg:mb-2 flex items-center gap-2">
                <span className="text-brand-600 dark:text-brand-400">🎯</span>
                Learning Objectives
              </h4>
              <ul className="space-y-1 lg:space-y-1.5">
                {lesson.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300 text-[11px] lg:text-xs">
                    <span className="text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0">✓</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Slide Thumbnails */}
          <div className="mb-3 lg:mb-4">
            <h4 className="text-xs lg:text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5 lg:mb-2 flex items-center gap-2">
              <span className="text-brand-600 dark:text-brand-400">📑</span>
              Slides ({totalSlides})
            </h4>
            <div className="space-y-1.5">
              {lesson.slides?.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}: ${slide.title}${index === currentSlide ? ' (current)' : ''}`}
                  aria-current={index === currentSlide ? 'true' : 'false'}
                  className={`
                    w-full p-2 rounded-lg border text-left transition-all text-xs
                    ${
                      index === currentSlide
                        ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-300 dark:border-brand-700 shadow-sm'
                        : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-brand-200 dark:hover:border-brand-800'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div className={`
                      flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                      ${
                        index === currentSlide
                          ? 'bg-brand-600 text-white'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }
                    `}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${
                        index === currentSlide
                          ? 'text-neutral-900 dark:text-neutral-100'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}>
                        {slide.title}
                      </p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                        {slide.type.charAt(0).toUpperCase() + slide.type.slice(1)}
                      </p>
                    </div>
                    {index === currentSlide && (
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400 animate-pulse" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quiz Button */}
          {lesson.quiz && (
            <button
              onClick={handleStartQuiz}
              aria-label={`Start quiz for ${lesson.title}`}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-semibold py-2 px-3 rounded-lg transition-all shadow-md hover:shadow-lg text-xs flex items-center justify-center gap-2">
              <span>📝</span>
              <span>Start Quiz</span>
            </button>
          )}
        </div>
      )
    },
    { 
      value: 'feedback', 
      label: 'Feedback', 
      icon: '💬',
      content: (
        <div className="h-full overflow-hidden">
          <FeedbackUnified moduleId={lesson.moduleId} />
        </div>
      )
    },
  ];

  return (
    <BaseModal
      open={isOpen}
      onClose={onClose}
      size="full"
    >
      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row h-[80vh] overflow-hidden">
        {/* Left Side - Slide Content */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 relative min-h-[50vh] lg:min-h-0">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-700 z-10">
            <div
              className="h-full bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 transition-all duration-500 ease-out shadow-lg shadow-brand-500/50"
              style={{ width: `${progress}%` }}
            />
            </div>

            {/* Slide Header */}
            <div className="pt-2 px-3 lg:px-4 pb-1.5 lg:pb-2 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-sm lg:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-700 dark:from-brand-400 dark:to-brand-500 mb-0.5">
                {lesson.title}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 lg:py-1 bg-brand-100 dark:bg-brand-900/30 rounded-full text-[10px] lg:text-xs font-bold text-brand-700 dark:text-brand-300">
                  <svg className="w-2.5 h-2.5 lg:w-3 lg:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Slide {currentSlide + 1} / {totalSlides}
                </span>
                <span className="text-[10px] lg:text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                  {Math.round(progress)}% Complete
                </span>
              </div>
            </div>

            {/* Slide Content with Animation */}
            <div className="flex-1 relative overflow-hidden">
              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-12 h-12 bg-gradient-to-br from-brand-500/10 to-transparent rounded-br-[60px] pointer-events-none z-10" />
              <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-brand-500/10 to-transparent rounded-tl-[60px] pointer-events-none z-10" />
              
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
                  <div className="h-full flex items-center justify-center p-2 lg:p-4">
                    {/* Video Slide */}
                    {currentSlideData.type === 'video' && (
                      <div className="w-full h-full flex items-center justify-center animate-fadeIn">
                        <video
                          key={currentSlide}
                          className="w-full h-full max-h-[40vh] lg:max-h-full object-contain rounded-lg lg:rounded-2xl shadow-2xl ring-2 lg:ring-4 ring-brand-500/20 hover:ring-brand-500/40 transition-all"
                          controls
                          autoPlay
                          preload="metadata"
                          src={currentSlideData.content?.videoUrl || currentSlideData.content}
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
                            src={currentSlideData.content?.imageUrl || currentSlideData.content}
                            alt={currentSlideData.content?.alt || currentSlideData.title}
                            loading="lazy"
                            className="w-full h-full max-h-[40vh] lg:max-h-full object-contain rounded-lg lg:rounded-2xl shadow-2xl ring-2 lg:ring-4 ring-brand-500/20 hover:ring-brand-500/40 transition-all hover:scale-[1.01] lg:hover:scale-[1.02] duration-300"
                            onError={() => setImageError(currentSlide)}
                            onLoad={() => setImageError(null)}
                          />
                        )}
                      </div>
                    )}

                    {/* Text Content Slide */}
                    {currentSlideData.type === 'text' && (
                      <div className="w-full h-full flex items-center justify-center p-3 lg:p-8 animate-fadeIn">
                        <div className="max-w-4xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-lg lg:rounded-2xl shadow-2xl p-4 lg:p-8 border border-neutral-200 dark:border-neutral-700">
                          <h3 className="text-xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-700 dark:from-brand-400 dark:to-brand-500 mb-3 lg:mb-6">
                            {currentSlideData.content?.title || currentSlideData.title}
                          </h3>
                          <div className="prose prose-sm lg:prose-lg dark:prose-invert max-w-none">
                            {currentSlideData.content?.body ? (
                              <div dangerouslySetInnerHTML={{ __html: currentSlideData.content.body }} />
                            ) : (
                              <p className="text-base lg:text-2xl text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                                {currentSlideData.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="p-2 lg:p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between gap-2">
                {/* Previous Button */}
                <button
                  onClick={handlePrevSlide}
                  disabled={currentSlide === 0 || isAnimating}
                  aria-label="Go to previous slide"
                  className="group px-3 lg:px-5 py-1.5 lg:py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-bold text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md hover:shadow-lg hover:scale-105 transform"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>

                {/* Page Indicators */}
                <div className="flex items-center gap-1.5">
                  {lesson.slides?.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      disabled={isAnimating}
                      className={`transition-all duration-500 rounded-full ${
                        index === currentSlide
                          ? 'w-6 h-2 bg-gradient-to-r from-brand-500 to-brand-600'
                          : 'w-2 h-2 bg-neutral-300 dark:bg-neutral-600 hover:bg-brand-400 hover:scale-110'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Next Button or Mark as Done */}
                {currentSlide === totalSlides - 1 ? (
                  <button 
                    onClick={handleMarkAsDone}
                    disabled={isAnimating}
                    aria-label={`Mark ${lesson.title} as done`}
                    className="group px-3 lg:px-5 py-1.5 lg:py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md hover:shadow-lg hover:scale-105 transform"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="hidden sm:inline">Mark as Done</span>
                    <span className="sm:hidden">Done</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNextSlide}
                    disabled={isAnimating}
                    aria-label="Go to next slide"
                    className="group px-3 lg:px-5 py-1.5 lg:py-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-lg font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md hover:shadow-lg hover:scale-105 transform"
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

          {/* Right Sidebar */}
          <div className="w-full lg:w-96 bg-white dark:bg-neutral-900 lg:border-l border-t lg:border-t-0 border-neutral-200 dark:border-neutral-700 overflow-hidden flex flex-col">
            {/* Tabs using BaseTabs (Phase 3 Architecture) */}
            <BaseTabs
              tabs={tabs}
              defaultValue="lesson"
            />
          </div>
        </div>
      </BaseModal>
    );
}

export default LessonViewer;
