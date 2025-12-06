import { motion } from 'framer-motion';

/**
 * FinishLine Component
 * 
 * Celebratory finish line at the end of the road journey
 * Shows completion status and encouragement
 * 
 * @param {Object} props
 * @param {boolean} props.allCompleted - Whether all modules are completed
 * @param {number} props.totalModules - Total number of modules
 * @param {number} props.completedModules - Number of completed modules
 * @param {Function} props.onShowCompletionModal - Callback to show completion modal
 */
export function FinishLine({ allCompleted, totalModules, completedModules, onShowCompletionModal }) {
  return (
    <motion.div
      id="finish-line"
      className="relative pt-20"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {/* No separate road section needed - main road extends to here */}

      {/* Checkered Flag Pattern */}
      <div className="relative z-10 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto border-4 border-neutral-800 dark:border-white">
        {/* Checkered Flag Animation */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-20">
          <motion.div
            animate={allCompleted ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="w-20 h-16 relative">
              {/* Checkered pattern */}
              <div className="grid grid-cols-4 grid-rows-3 w-full h-full border-2 border-neutral-800 dark:border-white rounded shadow-lg overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={`${
                      (Math.floor(i / 4) + (i % 4)) % 2 === 0
                        ? 'bg-neutral-900 dark:bg-white'
                        : 'bg-white dark:bg-neutral-900'
                    }`}
                  />
                ))}
              </div>
              {/* Flag pole */}
              <div className="absolute left-0 top-full w-1 h-12 bg-neutral-700" />
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="text-center pt-8">
          {allCompleted ? (
            <CompletedMessage 
              totalModules={totalModules} 
              onShowCompletionModal={onShowCompletionModal}
            />
          ) : (
            <ProgressMessage
              completedModules={completedModules}
              totalModules={totalModules}
            />
          )}
        </div>
      </div>

      {/* Confetti effect when all completed */}
      {allCompleted && <ConfettiEffect />}
    </motion.div>
  );
}

/**
 * Message shown when all modules completed
 */
function CompletedMessage({ totalModules, onShowCompletionModal }) {
  return (
    <>
      <motion.div
        className="text-6xl mb-4"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        🏆
      </motion.div>
      <h3 className="text-4xl font-black text-neutral-900 dark:text-white mb-2">
        Journey Complete!
      </h3>
      <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-6">
        You've mastered all {totalModules} modules! 🎉
      </p>
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border-2 border-green-200 dark:border-green-800 mb-6">
        <p className="text-green-700 dark:text-green-300 font-bold text-lg mb-2">
          🌟 Congratulations, Road Safety Expert!
        </p>
        <p className="text-green-600 dark:text-green-400 text-sm">
          You're ready to hit the road with confidence!
        </p>
      </div>

      {/* View Certificate Button */}
      <motion.button
        onClick={onShowCompletionModal}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full py-4 px-8 bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 hover:to-amber-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
      >
        <span>🎓</span>
        <span>View Certificate & Results</span>
      </motion.button>
    </>
  );
}

/**
 * Message shown while journey in progress
 */
function ProgressMessage({ completedModules, totalModules }) {
  const percentage = Math.round((completedModules / totalModules) * 100);

  return (
    <>
      <div className="text-6xl mb-4">🏁</div>
      <h3 className="text-4xl font-black text-neutral-900 dark:text-white mb-2">
        Keep Going!
      </h3>
      <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-6">
        You've completed {completedModules} of {totalModules} modules
      </p>
      <div className="bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-900/20 dark:to-blue-900/20 p-6 rounded-xl border-2 border-brand-200 dark:border-brand-800">
        <p className="text-brand-700 dark:text-brand-300 font-bold text-lg mb-4">
          {percentage}% Complete
        </p>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-brand-600 dark:text-brand-400 text-sm mt-4">
          You're doing great! Keep up the momentum! 🚀
        </p>
      </div>
    </>
  );
}

/**
 * Confetti animation when journey complete
 */
function ConfettiEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10%',
            backgroundColor: [
              '#ef4444',
              '#f59e0b',
              '#10b981',
              '#3b82f6',
              '#8b5cf6',
            ][i % 5],
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [0, 360],
            opacity: [1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 0.5,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      ))}
    </div>
  );
}

export default FinishLine;
