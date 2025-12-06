import { motion } from 'framer-motion';

/**
 * HeaderJourney Component
 * 
 * Modern header/hero section for the journey page with progress tracking
 * 
 * @param {Object} props
 * @param {number} props.progress - Overall progress percentage (0-100)
 * @param {number} props.level - Current user level
 * @param {number} props.xp - Total XP earned
 * @param {Object} props.routesCompleted - { completed: number, total: number }
 * @param {string} props.className - Optional additional classes
 */
export default function HeaderJourney({
  progress = 0,
  level = 1,
  xp = 0,
  routesCompleted = { completed: 0, total: 0 },
  className = '',
}) {
  return (
    <motion.header
      className={`relative overflow-hidden bg-gradient-to-br from-[#d81b46] via-[#c01539] to-[#a01332] ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Desktop: 3-column layout, Tablet/Mobile: stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Center: Hero Text + Progress Card */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            {/* Title & Subtitle - Better vertical centering */}
            <div className="text-center lg:text-left space-y-3">
              <motion.h1
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                Your Road Journey
              </motion.h1>
              <motion.p
                className="text-base sm:text-lg text-white/80 font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Master the rules of the road
              </motion.p>
            </div>

            {/* Progress Card - Polished glass UI */}
            <motion.div
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 md:p-6 shadow-lg shadow-black/10"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {/* Progress Label & Percentage */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm sm:text-base font-semibold text-white">
                  Overall Journey Progress
                </span>
                <motion.span
                  className="text-xl sm:text-2xl font-black text-yellow-300"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.4, type: 'spring' }}
                >
                  {Math.round(progress)}%
                </motion.span>
              </div>

              {/* Progress Bar with Animation */}
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label="Overall journey progress"
                className="relative h-3 sm:h-4 bg-white/20 rounded-full overflow-hidden shadow-inner"
              >
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 rounded-full shadow-md"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
                />
              </div>

              {/* Stats Footer */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {/* Routes Mastered */}
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-white mb-1">
                      {routesCompleted.completed}/{routesCompleted.total}
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/70 font-medium uppercase tracking-wide">
                      Routes Mastered
                    </div>
                  </div>

                  {/* Total Distance */}
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-white mb-1">
                      {routesCompleted.completed * 100} km
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/70 font-medium uppercase tracking-wide">
                      Total Distance
                    </div>
                  </div>

                  {/* XP Earned */}
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-yellow-300 mb-1">
                      {xp.toLocaleString()}
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/70 font-medium uppercase tracking-wide">
                      XP Earned
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Level Badge - Stronger visual connection */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end mt-6 lg:mt-0">
            <LevelBadge level={level} />
          </div>
        </div>
      </div>
    </motion.header>
  );
}

/**
 * LevelBadge Component
 * Circular badge displaying current level with enhanced glow and animations
 */
function LevelBadge({ level }) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.6, type: 'spring', stiffness: 120 }}
      whileHover={{ scale: 1.05 }}
      aria-label={`Current level: ${level}`}
    >
      {/* Stronger outer glow ring */}
      <div className="absolute -inset-3 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 rounded-full opacity-30 blur-2xl" />
      <motion.div
        className="absolute -inset-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full opacity-20 blur-xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Main badge circle - Responsive sizing */}
      <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-full bg-white border-4 sm:border-[5px] lg:border-[6px] border-yellow-400 shadow-2xl shadow-yellow-500/30 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs sm:text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">
            Level
          </div>
          <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-br from-[#d81b46] to-[#a01332] bg-clip-text text-transparent">
            {level}
          </div>
        </div>
      </div>

      {/* Decorative icons - Controlled positioning */}
      <div className="absolute -top-1 sm:-top-2 -left-1 sm:-left-2">
        <motion.div
          className="text-xl sm:text-2xl md:text-3xl"
          animate={{ rotate: [0, 10, 0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🏆
        </motion.div>
      </div>
      <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2">
        <motion.div
          className="text-xl sm:text-2xl md:text-3xl"
          animate={{ rotate: [0, -10, 0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        >
          🚗
        </motion.div>
      </div>
    </motion.div>
  );
}
