import { motion } from 'framer-motion';

/**
 * DiamondPin Component
 * 
 * Diamond-shaped checkpoint marker centered on the road
 * Indicates module position in the journey
 * 
 * @param {Object} props
 * @param {number} props.index - Module index (for numbering)
 * @param {string} props.status - 'completed', 'unlocked', or 'locked'
 */
export function DiamondPin({ index, status }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-700 text-white';
      case 'unlocked':
        return 'bg-brand-500 border-brand-700 text-white';
      case 'locked':
      default:
        return 'bg-neutral-400 dark:bg-neutral-600 border-neutral-500 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300';
    }
  };

  return (
    <motion.div
      className="absolute left-1/2 top-8 z-10"
      style={{ x: '-50%' }}
      whileHover={{ scale: 1.1, y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div
        className={`
          w-20 h-20 rounded-lg rotate-45 
          border-4 flex items-center justify-center 
          font-black text-2xl shadow-2xl 
          transition-all duration-300
          ${getStatusStyles()}
        `}
      >
        <div className="-rotate-45">
          {status === 'completed' ? (
            <CompletedIcon />
          ) : (
            <span>{index + 1}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Completed checkmark icon
 */
function CompletedIcon() {
  return (
    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default DiamondPin;
