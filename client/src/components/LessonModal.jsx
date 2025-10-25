import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * LessonModal - Dynamic component for displaying module lessons with slides
 * 
 * Features:
 * - Supports multiple slide types: video, image, animation
 * - Right sidebar with lesson details
 * - Navigation: next/prev buttons, keyboard arrows, page indicators
 * - Smooth animations: modal open/close, slide transitions
 * - Responsive design
 */
export default function LessonModal({ isOpen, onClose, lesson }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState('next'); // 'next' or 'prev' for animation
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset to first slide when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setDirection('next');
    }
  }, [isOpen]);

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
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNextSlide = () => {
    if (isAnimating || !lesson?.slides) return;
    if (currentSlide < lesson.slides.length - 1) {
      setDirection('next');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handlePrevSlide = () => {
    if (isAnimating || !lesson?.slides) return;
    if (currentSlide > 0) {
      setDirection('prev');
      setIsAnimating(true);
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
    }, 300);
  };

  if (!isOpen || !lesson) return null;

  const currentSlideData = lesson.slides?.[currentSlide];
  const totalSlides = lesson.slides?.length || 0;
  const progress = totalSlides > 0 ? ((currentSlide + 1) / totalSlides) * 100 : 0;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className={`relative w-full max-w-7xl h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 p-2 bg-white/90 dark:bg-neutral-800/90 hover:bg-white dark:hover:bg-neutral-800 rounded-full shadow-lg transition-all hover:scale-110 group"
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

        {/* Main Content Area */}
        <div className="flex h-full">
          {/* Left Side - Slide Content (70%) */}
          <div className="flex-1 flex flex-col bg-neutral-50 dark:bg-neutral-800 relative">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-700 z-10">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Slide Header */}
            <div className="pt-8 px-8 pb-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                {lesson.title}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Slide {currentSlide + 1} of {totalSlides}
              </p>
            </div>

            {/* Slide Content with Animation */}
            <div className="flex-1 relative overflow-hidden">
              <div
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  isAnimating
                    ? direction === 'next'
                      ? '-translate-x-full opacity-0'
                      : 'translate-x-full opacity-0'
                    : 'translate-x-0 opacity-100'
                }`}
              >
                {currentSlideData && (
                  <div className="h-full flex items-center justify-center p-8">
                    {/* Video Slide */}
                    {currentSlideData.type === 'video' && (
                      <div className="w-full h-full flex items-center justify-center">
                        <video
                          key={currentSlide}
                          className="max-w-full max-h-full rounded-xl shadow-2xl"
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
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={currentSlideData.content}
                          alt={currentSlideData.title}
                          className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                        />
                      </div>
                    )}

                    {/* Text Content Slide */}
                    {currentSlideData.type === 'text' && (
                      <div className="w-full h-full flex items-center justify-center p-12">
                        <div className="max-w-3xl">
                          <h3 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                            {currentSlideData.title}
                          </h3>
                          <div className="prose prose-lg dark:prose-invert">
                            <p className="text-xl text-neutral-700 dark:text-neutral-300 leading-relaxed">
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

            {/* Navigation Controls */}
            <div className="p-6 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between gap-4">
                {/* Previous Button */}
                <button
                  onClick={handlePrevSlide}
                  disabled={currentSlide === 0 || isAnimating}
                  className="px-6 py-3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                {/* Page Indicators */}
                <div className="flex items-center gap-2">
                  {lesson.slides?.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      disabled={isAnimating}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentSlide
                          ? 'w-8 h-3 bg-brand-600'
                          : 'w-3 h-3 bg-neutral-300 dark:bg-neutral-600 hover:bg-brand-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextSlide}
                  disabled={currentSlide === totalSlides - 1 || isAnimating}
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Lesson Details (30%) */}
          <div className="w-96 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-700 overflow-y-auto">
            <div className="p-6">
              {/* Lesson Info */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span className="font-semibold text-sm">Module {lesson.moduleId}</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                  {lesson.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                  {lesson.description}
                </p>
              </div>

              {/* Current Slide Details */}
              {currentSlideData && (
                <div className="mb-6 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    Current Slide
                  </h4>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
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

              {/* Complete Button */}
              {currentSlide === totalSlides - 1 && (
                <button className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark as Complete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

LessonModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  lesson: PropTypes.shape({
    moduleId: PropTypes.number,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    objectives: PropTypes.arrayOf(PropTypes.string),
    slides: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.oneOf(['video', 'image', 'text']).isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        description: PropTypes.string,
      })
    ).isRequired,
    resources: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        type: PropTypes.string,
        url: PropTypes.string.isRequired,
      })
    ),
  }),
};
