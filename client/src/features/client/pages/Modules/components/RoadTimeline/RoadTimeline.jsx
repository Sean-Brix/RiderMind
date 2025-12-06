import { useRef, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import ModuleCard from './ModuleCard';
import DiamondPin from './DiamondPin';
import StopSign from './StopSign';
import FinishLine from './FinishLine';

/**
 * RoadTimeline Component
 * 
 * Renders the road-themed timeline with modules displayed as cards
 * along a vertical road with alternating left/right positions
 * 
 * Features:
 * - Vertical road with dashed centerline
 * - Alternating module cards (left/right)
 * - Diamond checkpoint pins
 * - Stop signs between modules
 * - Finish line at the end
 * - Smooth scroll behavior
 * 
 * @param {Object} props
 * @param {Array} props.modules - Array of student modules
 * @param {Function} props.onModuleClick - Callback when module is clicked
 * @param {Function} props.onQuizClick - Callback when quiz button clicked
 * @param {Function} props.onStopSignClick - Callback when stop sign clicked
 * @param {Function} props.onShowCompletionModal - Callback to show completion modal
 */
const RoadTimeline = memo(function RoadTimeline({
  modules = [],
  onModuleClick,
  onQuizClick,
  onStopSignClick,
  onShowCompletionModal,
}) {
  const roadRef = useRef(null);

  // Smooth scroll when component mounts
  useEffect(() => {
    // Find first incomplete module and scroll to it
    const firstIncomplete = modules.findIndex(m => !m.isCompleted);
    if (firstIncomplete > 0) {
      const element = document.querySelector(`[data-module-index="${firstIncomplete}"]`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
    }
  }, [modules]);

  if (modules.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-500 dark:text-neutral-400">
        <p className="text-xl">No modules available yet</p>
        <p className="text-sm mt-2">Check back soon for new content!</p>
      </div>
    );
  }

  return (
    <div ref={roadRef} className="relative max-w-5xl mx-auto px-4 py-12">
      <h2 
        className="text-3xl font-black text-center mb-8 text-neutral-800 dark:text-white flex items-center justify-center gap-3"
        aria-label="Your learning road with available modules"
      >
        <img src="/logo.png" alt="RiderMind" className="w-10 h-10 rounded-lg object-cover" />
        <span>Your Learning Road</span>
        <span aria-hidden="true">🚦</span>
      </h2>

      <div 
        className="relative"
        role="list"
        aria-label={`Learning modules: ${modules.filter(m => m.isCompleted).length} of ${modules.length} completed`}
      >
        {/* Vertical Road Background */}
        <Road totalModules={modules.length} />

        {/* Module Timeline */}
        {modules.map((studentModule, index) => {
          const isUnlocked = index === 0 || modules[index - 1]?.isCompleted;
          const status = studentModule.isCompleted 
            ? 'completed' 
            : isUnlocked 
            ? 'unlocked' 
            : 'locked';
          const isLeft = index % 2 === 0;

          return (
            <motion.div
              key={studentModule.id}
              data-module-index={index}
              className={`relative ${index === modules.length - 1 ? 'mb-0' : 'mb-20'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Stop Sign (before each module except first) */}
              {index > 0 && (
                <StopSign
                  index={index}
                  previousModule={modules[index - 1]}
                  onClick={() => {
                    const prevCompleted = modules
                      .slice(0, index)
                      .reverse()
                      .find(m => m.isCompleted);
                    if (prevCompleted && onStopSignClick) {
                      onStopSignClick(prevCompleted);
                    }
                  }}
                />
              )}

              {/* Diamond Checkpoint Pin */}
              <DiamondPin
                index={index}
                status={status}
              />

              {/* Module Card */}
              <ModuleCard
                studentModule={studentModule}
                index={index}
                status={status}
                isLeft={isLeft}
                isUnlocked={isUnlocked}
                onModuleClick={onModuleClick}
                onQuizClick={onQuizClick}
              />
            </motion.div>
          );
        })}

        {/* Finish Line */}
        <FinishLine
          allCompleted={modules.every(m => m.isCompleted)}
          totalModules={modules.length}
          completedModules={modules.filter(m => m.isCompleted).length}
          onShowCompletionModal={onShowCompletionModal}
        />
      </div>
    </div>
  );
});

/**
 * Road Component
 * Renders the vertical road background with dashed centerline
 * Extends through all modules and connects to FinishLine
 */
function Road({ totalModules }) {
  return (
    <div 
      className="absolute left-1/2 top-0 bottom-0 w-24 bg-neutral-700 dark:bg-neutral-600 transform -translate-x-1/2 z-0"
    >
      {/* Dashed centerline */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 border-l-4 border-dashed border-yellow-400 transform -translate-x-1/2" />
      
      {/* Road edge lines */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/30" />
      <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/30" />
    </div>
  );
}

export default RoadTimeline;
