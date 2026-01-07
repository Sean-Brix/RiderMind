import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BaseModal } from './BaseModal';
import { Trophy, Star, Award, Download, Share2, X, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getLeaderboard } from '../../../../../../services/leaderboardService';

/**
 * CongratulationsModal - Celebration modal for module completion
 * Uses Phase 3 architecture (BaseModal)
 * 
 * Features:
 * - Confetti animation on mount
 * - Module completion stats
 * - Certificate preview
 * - Download certificate button
 * - Share progress button
 * - Continue to next module
 * - Real-time leaderboard showing user's rank
 */
export function CongratulationsModal({ 
  isOpen, 
  onClose, 
  moduleTitle,
  score,
  xpEarned,
  newLevel,
  leveledUp = false,
  completedModulesCount,
  totalModulesCount,
  onContinue,
  userId,
  accountId,
  studentModuleId
}) {
  const [showCertificate, setShowCertificate] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Generate RefID from accountId and studentModuleId
  const refId = accountId && studentModuleId 
    ? `REF-${String(accountId).padStart(4, '0')}-${String(studentModuleId).padStart(4, '0')}`
    : 'REF-0000-0000';

  // Trigger confetti on modal open with enhanced celebration
  useEffect(() => {
    if (isOpen) {
      const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
      
      // Initial burst from both sides
      const fireBurst = () => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: colors,
          ticks: 200
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: colors,
          ticks: 200
        });
      };

      // Fire immediately
      fireBurst();
      
      // Fire again after 250ms for extra celebration
      const timeout = setTimeout(fireBurst, 250);
      
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Fetch leaderboard data when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      setLoadingLeaderboard(true);
      getLeaderboard('all-time', 100) // Get top 100 to find user's rank
        .then(response => {
          if (response.success) {
            const allUsers = response.data || [];
            const userRank = allUsers.find(u => u.userId === userId);
            
            // Get top 5 and user's position
            const topFive = allUsers.slice(0, 5);
            const userIndex = allUsers.findIndex(u => u.userId === userId);
            
            setLeaderboardData({
              topUsers: topFive,
              currentUser: userRank,
              userRank: userIndex >= 0 ? userIndex + 1 : null,
              totalUsers: response.totalUsers || allUsers.length
            });
          }
        })
        .catch(error => {
          console.error('Failed to fetch leaderboard:', error);
        })
        .finally(() => {
          setLoadingLeaderboard(false);
        });
    }
  }, [isOpen, userId]);

  const progressPercentage = totalModulesCount > 0 
    ? Math.round((completedModulesCount / totalModulesCount) * 100) 
    : 0;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="md">
      <div className="relative bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 rounded-3xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-neutral-800 transition-all hover:rotate-90 duration-300"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </button>

        {/* Header with Trophy */}
        <div className="text-center pt-12 pb-8 px-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
            className="inline-block"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
              <Trophy className="w-12 h-12 text-white" strokeWidth={2} />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-black text-neutral-900 dark:text-white mb-3"
          >
            🎉 Congratulations!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-neutral-600 dark:text-neutral-400"
          >
            You've completed <span className="font-bold text-brand-600 dark:text-brand-400">{moduleTitle}</span>
          </motion.p>
        </div>

        {/* Stats Cards */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Star className="w-6 h-6" fill="currentColor" />
                </div>
                <div>
                  <p className="text-sm font-medium opacity-90">Quiz Score</p>
                  <p className="text-2xl font-black">{score}%</p>
                </div>
              </div>
            </motion.div>

            {/* XP Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-4 text-white shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium opacity-90">XP Earned</p>
                  <p className="text-2xl font-black">+{xpEarned}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Level Up Banner */}
          {leveledUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Trophy className="w-6 h-6" fill="currentColor" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium opacity-90">Level Up!</p>
                  <p className="text-xl font-black">You're now Level {newLevel}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-lg border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Overall Progress
              </p>
              <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
                {completedModulesCount} / {totalModulesCount} modules
              </p>
            </div>
            <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ delay: 0.9, duration: 1 }}
                className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full shadow-lg"
              />
            </div>
          </motion.div>
        </div>

        {/* Leaderboard Section */}
        {leaderboardData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="px-8 pb-6"
          >
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-lg border border-neutral-200 dark:border-neutral-700">
              {/* Current User Rank Card */}
              {leaderboardData.currentUser && (
                <div className="mb-4 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium opacity-90">Your Rank</p>
                        <p className="text-2xl font-black">
                          {leaderboardData.userRank 
                            ? `#${leaderboardData.userRank} of ${leaderboardData.totalUsers}`
                            : 'Not Ranked'
                          }
                        </p>
                      </div>
                    </div>
                    {leaderboardData.currentUser.performanceScore && (
                      <div className="text-right">
                        <p className="text-sm font-medium opacity-90">Score</p>
                        <p className="text-xl font-bold">{leaderboardData.currentUser.performanceScore}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Top 5 Leaderboard Table */}
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  Top Performers
                </h3>
                <div className="space-y-2">
                  {leaderboardData.topUsers.map((user, index) => {
                    const isCurrentUser = user.userId === userId;
                    return (
                      <div 
                        key={user.userId}
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                          isCurrentUser 
                            ? 'bg-brand-50 dark:bg-brand-900/20 border-2 border-brand-500' 
                            : 'bg-neutral-50 dark:bg-neutral-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8">
                            {index === 0 && <span className="text-xl">🥇</span>}
                            {index === 1 && <span className="text-xl">🥈</span>}
                            {index === 2 && <span className="text-xl">🥉</span>}
                            {index > 2 && (
                              <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400">
                                #{user.rank}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${
                              isCurrentUser 
                                ? 'text-brand-700 dark:text-brand-300' 
                                : 'text-neutral-900 dark:text-white'
                            }`}>
                              {isCurrentUser ? 'You' : (user.displayName || user.name || 'Anonymous')}
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                              {user.totalModulesCompleted} modules • {user.averageQuizScore}% avg
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-neutral-900 dark:text-white">
                            {user.performanceScore}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">pts</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {loadingLeaderboard && (
          <div className="px-8 pb-6">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading leaderboard...</p>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Section */}
        {showCertificate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-8 pb-6"
          >
            <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl p-6 border-2 border-amber-200 dark:border-amber-800">
              <div className="text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-amber-600" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                  Certificate of Completion
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  This certifies that you have successfully completed {moduleTitle}
                </p>
                <button className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto">
                  <Download className="w-4 h-4" />
                  Download Certificate
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="px-8 pb-8"
        >
          <div className="flex flex-col gap-3">
            {/* Continue Button */}
            <button
              onClick={() => {
                onContinue?.();
                onClose();
              }}
              className="w-full px-6 py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Continue Learning →
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowCertificate(!showCertificate)}
                className="px-4 py-3 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                Certificate
              </button>
              <button
                onClick={() => {
                  // Share functionality
                  if (navigator.share) {
                    navigator.share({
                      title: 'Module Completed!',
                      text: `I just completed ${moduleTitle} with ${score}% score!`,
                    }).catch(() => {});
                  }
                }}
                className="px-4 py-3 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </BaseModal>
  );
}
