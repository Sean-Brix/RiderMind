import { useState } from 'prop-types';
import PropTypes from 'prop-types';

/**
 * LessonSlideViewer - Displays lesson slide content with animations
 * Supports video, image, and text slide types
 */
export default function LessonSlideViewer({ 
  slide, 
  slideIndex,
  isAnimating, 
  direction,
  onImageError 
}) {
  const [imageError, setImageError] = useState(null);

  const handleImageError = (e) => {
    console.error('Image failed to load:', {
      src: slide.content,
      title: slide.title,
      slideIndex,
      error: e
    });
    setImageError(slideIndex);
    if (onImageError) onImageError(slideIndex);
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div
        className={`absolute inset-0 transition-all duration-700 ease-out ${
          isAnimating
            ? direction === 'next'
              ? '-translate-x-full opacity-0 scale-95'
              : 'translate-x-full opacity-0 scale-95'
            : 'translate-x-0 opacity-100 scale-100'
        }`}
      >
        {slide && (
          <div className="h-full flex items-center justify-center p-8">
            {/* Video Slide */}
            {slide.type === 'video' && (
              <div className="w-full h-full flex items-center justify-center animate-fadeIn">
                <video
                  key={slideIndex}
                  className="w-full h-full object-contain rounded-2xl shadow-2xl ring-4 ring-brand-500/20 hover:ring-brand-500/40 transition-all"
                  controls
                  autoPlay
                  src={slide.content}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Image Slide */}
            {slide.type === 'image' && (
              <div className="w-full h-full flex items-center justify-center animate-fadeIn">
                {imageError === slideIndex ? (
                  <div className="text-center p-12 animate-fadeIn">
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
                    src={slide.content}
                    alt={slide.title}
                    className="w-full h-full object-contain rounded-2xl shadow-2xl ring-4 ring-brand-500/20 hover:ring-brand-500/40 transition-all hover:scale-[1.02] duration-300"
                    onError={handleImageError}
                    onLoad={() => setImageError(null)}
                  />
                )}
              </div>
            )}

            {/* Text Content Slide */}
            {slide.type === 'text' && (
              <div className="w-full h-full flex items-center justify-center p-12 animate-fadeIn">
                <div className="max-w-4xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-neutral-200 dark:border-neutral-700">
                  <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-700 dark:from-brand-400 dark:to-brand-500 mb-8">
                    {slide.title}
                  </h3>
                  <div className="prose prose-xl dark:prose-invert max-w-none">
                    <p className="text-2xl text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                      {slide.content}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-brand-500/10 to-transparent rounded-br-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-brand-500/10 to-transparent rounded-tl-[100px] pointer-events-none" />
    </div>
  );
}

LessonSlideViewer.propTypes = {
  slide: PropTypes.shape({
    id: PropTypes.number,
    type: PropTypes.oneOf(['video', 'image', 'text']).isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    description: PropTypes.string,
  }),
  slideIndex: PropTypes.number.isRequired,
  isAnimating: PropTypes.bool.isRequired,
  direction: PropTypes.oneOf(['next', 'prev']).isRequired,
  onImageError: PropTypes.func,
};
