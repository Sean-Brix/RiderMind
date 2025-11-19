import PropTypes from 'prop-types';

/**
 * LessonNavigation - Navigation controls for lesson slides
 * Includes prev/next buttons and progress indicators
 */
export default function LessonNavigation({
  currentSlide,
  totalSlides,
  slides,
  isAnimating,
  isCompleting,
  hasQuiz,
  answers,
  onPrev,
  onNext,
  goToSlide,
  onComplete,
}) {
  const isLastSlide = currentSlide === totalSlides - 1;

  return (
    <div className="p-8 bg-gradient-to-t from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center justify-between gap-6">
        {/* Previous Button */}
        <button
          onClick={onPrev}
          disabled={currentSlide === 0 || isAnimating}
          className="group px-8 py-4 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg hover:shadow-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-brand-300 dark:hover:border-brand-600 disabled:hover:border-neutral-200 dark:disabled:hover:border-neutral-700"
        >
          <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>

        {/* Page Indicators */}
        <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border-2 border-neutral-200 dark:border-neutral-700">
          {slides?.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isAnimating}
              className={`transition-all duration-500 rounded-full ${
                index === currentSlide
                  ? 'w-12 h-4 bg-gradient-to-r from-brand-500 to-brand-600 shadow-lg shadow-brand-500/50'
                  : answers?.[slides[index]?.id]
                    ? 'w-4 h-4 bg-green-500 hover:bg-green-600 shadow-md hover:scale-110'
                    : 'w-4 h-4 bg-neutral-300 dark:bg-neutral-600 hover:bg-brand-400 hover:scale-110'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button or Complete */}
        {isLastSlide ? (
          <button 
            onClick={onComplete}
            disabled={isCompleting || isAnimating}
            className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl hover:shadow-2xl hover:scale-105 transform"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>{hasQuiz ? 'Take Quiz' : 'Mark as Done'}</span>
            {isCompleting && (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={isAnimating}
            className="group px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl hover:shadow-2xl hover:scale-105 transform"
          >
            <span>Next</span>
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

LessonNavigation.propTypes = {
  currentSlide: PropTypes.number.isRequired,
  totalSlides: PropTypes.number.isRequired,
  slides: PropTypes.array,
  isAnimating: PropTypes.bool.isRequired,
  isCompleting: PropTypes.bool.isRequired,
  hasQuiz: PropTypes.bool.isRequired,
  answers: PropTypes.object,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  goToSlide: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
};
