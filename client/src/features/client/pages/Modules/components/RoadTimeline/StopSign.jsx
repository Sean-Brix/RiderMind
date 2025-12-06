import { motion } from 'framer-motion';

/**
 * StopSign Component
 * 
 * Red octagonal stop sign between modules
 * Clicking shows feedback/achievement for previous module
 * 
 * @param {Object} props
 * @param {number} props.index - Module index
 * @param {Object} props.previousModule - Previous module data
 * @param {Function} props.onClick - Click handler
 */
export function StopSign({ index, previousModule, onClick }) {
  return (
    <motion.div
      className="absolute left-1/2 -top-12 z-20 cursor-pointer"
      style={{ x: '-50%' }}
      onClick={onClick}
      whileHover={{ scale: 1.1, y: -4 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div className="relative">
        {/* Stop sign octagon */}
        <div
          className="w-16 h-16 bg-red-600 border-4 border-white shadow-2xl flex items-center justify-center transition-transform hover:rotate-12"
          style={{
            clipPath:
              'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
          }}
        >
          <span className="text-white font-black text-xs">STOP</span>
        </div>

        {/* Sign post */}
        <div className="absolute left-1/2 top-full w-2 h-8 bg-neutral-500 transform -translate-x-1/2" />
        
        {/* Tooltip on hover */}
        <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 translate-y-full opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-neutral-900 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap">
            View Module {index} feedback
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default StopSign;
