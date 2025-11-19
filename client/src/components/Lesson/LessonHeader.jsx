import PropTypes from 'prop-types';

/**
 * LessonHeader - Header component for lesson modal
 * Displays progress bar, title, slide count, and close button
 */
export default function LessonHeader({ title, currentSlide, totalSlides, progress, onClose }) {
  return (
    <>
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-700 z-10">
        <div
          className="h-full bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 transition-all duration-500 ease-out shadow-lg shadow-brand-500/50"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 left-6 z-20 p-3 bg-white/95 dark:bg-neutral-800/95 hover:bg-white dark:hover:bg-neutral-800 rounded-xl shadow-lg transition-all hover:scale-110 hover:rotate-90 duration-300 group backdrop-blur-sm border border-neutral-200 dark:border-neutral-700"
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

      {/* Title Section */}
      <div className="pt-10 px-8 pb-5 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-700 dark:from-brand-400 dark:to-brand-500 mb-2">
              {title}
            </h2>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 dark:bg-brand-900/30 rounded-full text-sm font-bold text-brand-700 dark:text-brand-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Slide {currentSlide + 1} / {totalSlides}
              </span>
              <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                {Math.round(progress)}% Complete
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

LessonHeader.propTypes = {
  title: PropTypes.string.isRequired,
  currentSlide: PropTypes.number.isRequired,
  totalSlides: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};
