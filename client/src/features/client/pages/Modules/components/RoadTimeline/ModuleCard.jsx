import { memo } from 'react';
import { motion } from 'framer-motion';
import { Lock, PlayCircle, Award } from 'lucide-react';

/**
 * ModuleCard Component
 * 
 * Interactive card displaying module information, progress, and actions
 * Alternates between left and right sides of the road
 * 
 * @param {Object} props
 * @param {Object} props.studentModule - Student module data
 * @param {number} props.index - Module index
 * @param {string} props.status - 'completed', 'unlocked', or 'locked'
 * @param {boolean} props.isLeft - Whether card is on left side of road
 * @param {boolean} props.isUnlocked - Whether module is unlocked
 * @param {Function} props.onModuleClick - Click handler for viewing lessons
 * @param {Function} props.onQuizClick - Click handler for taking quiz
 */
const ModuleCard = memo(function ModuleCard({
  studentModule,
  index,
  status,
  isLeft,
  isUnlocked,
  onModuleClick,
  onQuizClick,
}) {
  const { module, progress, quizAttempts = 0, isCompleted } = studentModule;
  const { title, description } = module;

  const canTakeQuiz = progress >= 90;
  const hasViewedLessons = progress > 0;

  // Status-based styling
  const getStatusBorderColor = () => {
    switch (status) {
      case 'completed':
        return 'border-l-green-500';
      case 'unlocked':
        return 'border-l-brand-600';
      case 'locked':
      default:
        return 'border-l-neutral-400 dark:border-l-neutral-600';
    }
  };

  const getStatusBgColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/10';
      case 'unlocked':
        return 'bg-white dark:bg-neutral-800';
      case 'locked':
      default:
        return 'bg-neutral-100 dark:bg-neutral-800/50';
    }
  };

  return (
    <motion.div
      className={`
        relative w-5/12 z-10
        ${isLeft ? 'mr-auto' : 'ml-auto'}
      `}
      data-module-index={index}
      role="article"
      aria-label={`Module ${index + 1}: ${title}. Status: ${isCompleted ? 'Completed' : isUnlocked ? 'Available' : 'Locked'}`}
      whileHover={isUnlocked ? { scale: 1.02 } : {}}
      transition={{ type: 'spring', stiffness: 300 }}
      // Animate when module becomes completed
      animate={isCompleted ? {
        scale: [1, 1.05, 1],
        transition: { 
          duration: 0.6,
          times: [0, 0.5, 1],
          ease: "easeOut"
        }
      } : {}}
    >
      <motion.div
        className={`
          rounded-xl border-l-8 shadow-xl overflow-hidden
          transition-all duration-300
          ${getStatusBorderColor()}
          ${getStatusBgColor()}
          ${!isUnlocked ? 'opacity-60' : ''}
        `}
        // Animate background and border when completing
        animate={isCompleted ? {
          borderColor: ['#6366f1', '#10b981', '#10b981'],
          backgroundColor: ['#ffffff', '#f0fdf4', '#f0fdf4']
        } : {}}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          {/* Distance Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-r from-brand-500 to-brand-700 text-white px-4 py-2 rounded-lg shadow-md text-sm font-bold">
              📍 +100 km
            </div>
            <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-black text-lg text-neutral-700 dark:text-neutral-300">
              {index + 1}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-3 leading-tight">
            {title}
          </h3>

          {/* Description */}
          <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 leading-relaxed">
            {description}
          </p>

          {/* Progress Bar - Only show if not completed */}
          {isUnlocked && !isCompleted && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Progress
                </span>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                  {Math.round(progress)}%
                </span>
              </div>
              <div 
                className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden shadow-inner"
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Module progress: ${Math.round(progress)} percent`}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-500 to-brand-600 shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* Quiz Attempts */}
          {quizAttempts > 0 && (
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 mb-4">
              <Award className="w-4 h-4" />
              <span>Quiz attempts: {quizAttempts}</span>
            </div>
          )}

          {/* Completion Badge */}
          {isCompleted && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md mb-4">
              <span className="text-lg">✅</span>
              <span className="font-bold text-sm">Route Complete</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          {isUnlocked ? (
            <>
              {/* Continue/Start/Review Button */}
              <motion.button
                onClick={() => onModuleClick?.(studentModule)}
                onMouseEnter={() => {
                  // Preload modal component on hover
                  import('../LessonViewer').catch(() => {});
                }}
                aria-label={`${isCompleted ? 'Review' : hasViewedLessons ? 'Continue' : 'Start'} ${title} lessons`}
                className="w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-700 hover:to-brand-900 shadow-lg transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlayCircle className="w-5 h-5" />
                <span>
                  {isCompleted ? 'Review' : hasViewedLessons ? 'Continue Driving' : 'Start Route'}
                </span>
              </motion.button>

              {/* Quiz Button - Only show if not completed and can take quiz */}
              {canTakeQuiz && !isCompleted && (
                <motion.button
                  onClick={() => onQuizClick?.(studentModule)}
                  onMouseEnter={() => {
                    // Preload quiz modal component on hover
                    import('../QuizViewer').catch(() => {});
                  }}
                  aria-label={`Take quiz for ${title}${quizAttempts > 0 ? `. Previous attempts: ${quizAttempts}` : ''}`}
                  className="w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Award className="w-5 h-5" />
                  <span>Take Quiz</span>
                </motion.button>
              )}
            </>
          ) : (
            /* Locked State */
            <div 
              role="status"
              aria-label={`${title} is locked. Complete previous module to unlock.`}
              className="flex items-center justify-center gap-3 py-4 text-neutral-500 dark:text-neutral-400"
            >
              <Lock className="w-5 h-5" aria-hidden="true" />
              <span className="font-semibold">Complete previous route to unlock</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
});

export default ModuleCard;
