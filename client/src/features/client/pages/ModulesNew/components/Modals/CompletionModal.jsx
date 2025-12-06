import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { BaseModal } from '../Modals/BaseModal';
import Certificate from '../Certificate/Certificate';
import { Download, Trophy, TrendingUp, Users, Award, Share2, X } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

/**
 * CompletionModal Component
 * 
 * Displays comprehensive completion experience including:
 * - Congratulatory message with animations
 * - Progress summary statistics
 * - Certificate preview and download
 * - Leaderboard placement
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility state
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.userData - User information
 * @param {Object} props.completionData - Completion statistics
 * @param {Object} props.leaderboardData - Leaderboard information
 */
export function CompletionModal({ 
  isOpen, 
  onClose,
  userData = {},
  completionData = {},
  leaderboardData = {}
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef(null);

  const {
    userName = 'Student',
    userId = 'USER-0000'
  } = userData;

  const {
    courseName = 'Driver Education Course',
    totalModules = 0,
    completedModules = 0,
    totalQuizzes = 0,
    passedQuizzes = 0,
    averageScore = 0,
    totalTimeSpent = 0, // in minutes
    completionDate = new Date(),
    certificateId = `CERT-${Date.now()}`
  } = completionData;

  const {
    rank = 0,
    totalUsers = 0,
    topPerformers = []
  } = leaderboardData;

  // Calculate statistics
  const completionPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  const quizSuccessRate = totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0;
  const hoursSpent = Math.floor(totalTimeSpent / 60);
  const minutesSpent = totalTimeSpent % 60;

  // Format rank with ordinal suffix
  const getRankWithSuffix = (rank) => {
    if (rank === 0) return 'N/A';
    const j = rank % 10;
    const k = rank % 100;
    if (j === 1 && k !== 11) return rank + 'st';
    if (j === 2 && k !== 12) return rank + 'nd';
    if (j === 3 && k !== 13) return rank + 'rd';
    return rank + 'th';
  };

  // Download certificate as PDF using react-to-print (pixel-perfect)
  const handlePrint = useReactToPrint({
    contentRef: certificateRef,
    documentTitle: `RiderMind_Certificate_${userName.replace(/\s+/g, '_')}_${certificateId}`,
    onBeforePrint: () => {
      setIsDownloading(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsDownloading(false);
    },
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        html {
          margin: 0 !important;
          padding: 0 !important;
        }
      }
    `
  });

  const downloadCertificate = () => {
    if (!certificateRef.current) {
      console.error('Certificate ref is not available');
      return;
    }
    handlePrint();
  };

  // Share achievement (mock implementation)
  const shareAchievement = () => {
    const shareText = `🎉 I just completed the ${courseName} on RiderMind! Average score: ${averageScore}% 🚗`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Course Completion',
        text: shareText,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Achievement copied to clipboard!');
      });
    }
  };

  return (
    <BaseModal open={isOpen} onClose={onClose} size="full" showClose={true}>
      <div className="bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
        <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Congratulations Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              {/* Animated Trophy */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.2
                }}
                className="inline-block mb-6"
              >
                <div className="relative">
                  <Trophy className="w-32 h-32 text-amber-500 drop-shadow-2xl" />
                  {/* Sparkle effects */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="absolute -top-4 -right-4 text-4xl"
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.5
                    }}
                    className="absolute -bottom-4 -left-4 text-4xl"
                  >
                    🎉
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1
                    }}
                    className="absolute -top-4 -left-4 text-4xl"
                  >
                    🌟
                  </motion.div>
                </div>
              </motion.div>

              <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-amber-500 mb-6">
                Congratulations!
              </h1>
              <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
                {userName}
              </h2>
              <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                You've successfully completed the <span className="font-bold text-brand-600 dark:text-brand-400">{courseName}</span>! 
                Your dedication and hard work have paid off. 🎊
              </p>
            </motion.div>

            {/* Progress Summary Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            >
              {/* Modules Completed */}
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
                    <Award className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Modules</p>
                    <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                      {completedModules}/{totalModules}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-brand-600 to-brand-700 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Quiz Success Rate */}
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Avg Score</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {averageScore}%
                    </p>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {passedQuizzes}/{totalQuizzes} quizzes passed
                </p>
              </div>

              {/* Time Spent */}
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Time Invested</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {hoursSpent}h {minutesSpent}m
                    </p>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Dedicated learning time
                </p>
              </div>

              {/* Leaderboard Rank */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/80">Your Rank</p>
                    <p className="text-3xl font-bold">
                      {getRankWithSuffix(rank)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-white/90">
                  Out of {totalUsers} learners
                </p>
              </div>
            </motion.div>

            {/* Certificate Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-16"
            >
              <h3 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-6 text-center">
                Your Certificate
              </h3>
              
              {/* Certificate Container - scaled down for preview */}
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 shadow-xl overflow-hidden flex justify-center">
                <div style={{ 
                  transform: 'scale(0.35)', 
                  transformOrigin: 'top center',
                  width: '1122px',
                  height: '794px',
                  marginBottom: '-500px' // Collapse extra space from scaled content
                }}>
                  <Certificate
                    ref={certificateRef}
                    userName={userName}
                    courseName={courseName}
                    completionDate={completionDate}
                    totalModules={totalModules}
                    averageScore={averageScore}
                    certificateId={certificateId}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <motion.button
                  onClick={downloadCertificate}
                  disabled={isDownloading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-6 h-6" />
                  {isDownloading ? 'Generating PDF...' : 'Download Certificate'}
                </motion.button>

                <motion.button
                  onClick={shareAchievement}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
                >
                  <Share2 className="w-6 h-6" />
                  Share Achievement
                </motion.button>
              </div>
            </motion.div>

            {/* Leaderboard Section */}
            {rank > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="mb-16"
              >
                <h3 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-6 text-center">
                  Leaderboard Standing
                </h3>
                
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8 border border-neutral-200 dark:border-neutral-700">
                  {/* User's Position Highlight */}
                  <div className="bg-gradient-to-r from-brand-50 to-amber-50 dark:from-brand-900/20 dark:to-amber-900/20 rounded-lg p-6 mb-6 border-2 border-brand-300 dark:border-brand-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {rank}
                        </div>
                        <div>
                          <p className="font-bold text-lg text-neutral-800 dark:text-neutral-200">
                            {userName} (You)
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Average Score: {averageScore}%
                          </p>
                        </div>
                      </div>
                      <Trophy className="w-8 h-8 text-amber-500" />
                    </div>
                  </div>

                  {/* Top Performers */}
                  {topPerformers.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
                        Top Performers
                      </h4>
                      <div className="space-y-3">
                        {topPerformers.slice(0, 5).map((performer, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                index === 0 ? 'bg-amber-500 text-white' :
                                index === 1 ? 'bg-neutral-400 text-white' :
                                index === 2 ? 'bg-orange-700 text-white' :
                                'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                              }`}>
                                {index + 1}
                              </div>
                              <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                                {performer.name}
                              </p>
                            </div>
                            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                              {performer.score}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Closing Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-center py-12"
            >
              <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-6">
                Continue your learning journey with more courses!
              </p>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 rounded-lg font-semibold transition-all"
              >
                Back to Dashboard
              </motion.button>
            </motion.div>
          </div>

          {/* Hidden Print-Only Certificate */}
          <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
        <Certificate
          ref={certificateRef}
          userName={userName}
          courseName={courseName}
          completionDate={completionDate}
          totalModules={totalModules}
          averageScore={averageScore}
          certificateId={certificateId}
        />
        </div>
      </div>
    </BaseModal>
  );
}

export default CompletionModal;
