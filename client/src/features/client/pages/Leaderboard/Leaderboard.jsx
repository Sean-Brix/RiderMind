import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../../../components/Navbar';
import { getLeaderboard } from '../../../../services/leaderboardService';

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState('all-time');
  const currentUser = getUser();

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFrame]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLeaderboard(timeFrame, 50);
      if (response.success) {
        setLeaderboardData(response.data);
      } else {
        setError('Failed to load leaderboard');
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const [profilePictures, setProfilePictures] = useState({});

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Fetch profile pictures for all users
  useEffect(() => {
    async function fetchProfilePictures() {
      const userIds = leaderboardData.map(user => user.userId);
      const pictures = {};
      
      for (const userId of userIds) {
        // Check cache first
        const cached = localStorage.getItem(`profilePicture_${userId}`);
        if (cached && cached !== 'null') {
          pictures[userId] = cached;
        }
      }
      
      setProfilePictures(pictures);
    }

    if (leaderboardData.length > 0) {
      fetchProfilePictures();
    }
  }, [leaderboardData]);

  // Get podium (top 3)
  const podium = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);

  // Find current user's rank
  const currentUserRank = leaderboardData.find(user => user.userId === currentUser?.id);

  const getPodiumPosition = (rank) => {
    switch (rank) {
      case 1:
        return 'order-2'; // Center
      case 2:
        return 'order-1'; // Left
      case 3:
        return 'order-3'; // Right
      default:
        return '';
    }
  };

  const getPodiumHeight = (rank) => {
    switch (rank) {
      case 1:
        return 'h-40';
      case 2:
        return 'h-32';
      case 3:
        return 'h-24';
      default:
        return 'h-16';
    }
  };

  const getMedalColor = (rank) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-neutral-300 to-neutral-500';
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading leaderboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">🏆 Leaderboard</h1>
              <p className="text-brand-100 text-lg max-w-2xl mx-auto">
                See how you rank against other riders in the RiderMind community
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Time Frame Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Time Period
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTimeFrame('month')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    timeFrame === 'month'
                      ? 'bg-brand-600 text-white shadow-lg scale-105'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  📅 This Month
                </button>
                <button
                  onClick={() => setTimeFrame('year')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    timeFrame === 'year'
                      ? 'bg-brand-600 text-white shadow-lg scale-105'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  📆 This Year
                </button>
                <button
                  onClick={() => setTimeFrame('all-time')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    timeFrame === 'all-time'
                      ? 'bg-brand-600 text-white shadow-lg scale-105'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  ⏰ All Time
                </button>
              </div>
            </div>
          </motion.div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {leaderboardData.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-xl shadow-lg">
              <div className="text-6xl mb-4">🤷</div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                No Data Yet
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Be the first to complete modules and appear on the leaderboard!
              </p>
            </div>
          ) : (
            <>

            {/* Podium (Top 3) */}
            {podium.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-12"
              >
                <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 text-center">
                  🏆 Top Performers
                </h2>
                <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-8">
                  {podium.map((user) => (
                    <motion.div
                      key={user.rank}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 + (user.rank * 0.1) }}
                      className={`flex flex-col items-center ${getPodiumPosition(user.rank)} flex-1 max-w-[140px]`}
                    >
                      {/* Avatar */}
                      <div className={`relative mb-2 md:mb-4 ${user.rank === 1 ? 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28' : 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24'}`}>
                        <div className={`w-full h-full bg-gradient-to-br ${getMedalColor(user.rank)} rounded-full flex items-center justify-center text-white font-bold ${user.rank === 1 ? 'text-3xl' : 'text-2xl'} shadow-lg overflow-hidden`}>
                          {profilePictures[user.userId] ? (
                            <img 
                              src={profilePictures[user.userId]} 
                              alt={user.displayName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : null}
                          {!profilePictures[user.userId] && (
                            <span>{getInitials(user.displayName)}</span>
                          )}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-white dark:bg-neutral-800 rounded-full p-2 shadow-lg">
                          <span className="text-2xl">
                            {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        </div>
                      </div>

                      {/* Name */}
                      <h3 className={`font-bold text-neutral-900 dark:text-neutral-100 mb-1 text-center text-xs sm:text-sm ${user.rank === 1 ? 'md:text-xl' : 'md:text-lg'}`}>
                        {user.displayName}
                      </h3>

                      {/* Score */}
                      <div className={`font-bold mb-1 ${user.rank === 1 ? 'text-lg sm:text-xl md:text-2xl text-brand-600 dark:text-brand-400' : 'text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-400'}`}>
                        {user.averageQuizScore}% avg
                      </div>

                      {/* Performance Score */}
                      <div className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-500 mb-2">
                        {user.performanceScore} pts
                      </div>

                      {/* Stats */}
                      <div className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400 text-center mb-2 md:mb-4 space-y-1">
                        <div className="flex items-center justify-center gap-1">
                          <span>📚</span>
                          <span>{user.totalModulesCompleted}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <span>✏️</span>
                          <span>{user.totalQuizAttempts}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <span>✅</span>
                          <span>{user.passRate}%</span>
                        </div>
                      </div>

                      {/* Podium Block */}
                      <div className={`w-full sm:w-28 md:w-32 ${getPodiumHeight(user.rank)} bg-gradient-to-br ${getMedalColor(user.rank)} rounded-t-lg shadow-lg flex items-center justify-center`}>
                        <span className="text-white font-bold text-2xl sm:text-3xl md:text-4xl">#{user.rank}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Rest of Leaderboard */}
            {restOfLeaderboard.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700"
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-neutral-100 dark:bg-neutral-700">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">Rank</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">Rider</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">Avg Score</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">Points</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">Modules</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">Attempts</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">Pass Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                      {restOfLeaderboard.map((user, index) => (
                        <motion.tr
                          key={user.rank}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.5 + (index * 0.05) }}
                          className={`hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors ${
                            user.userId === currentUser?.id ? 'bg-brand-50 dark:bg-brand-900/20' : ''
                          }`}
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            #{user.rank}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm overflow-hidden">
                                {profilePictures[user.userId] ? (
                                  <img 
                                    src={profilePictures[user.userId]} 
                                    alt={user.displayName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : null}
                                {!profilePictures[user.userId] && (
                                  <span>{getInitials(user.displayName)}</span>
                                )}
                              </div>
                              <div>
                                <span className="font-medium text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm block">
                                  {user.displayName}
                                  {user.userId === currentUser?.id && (
                                    <span className="ml-2 text-xs bg-brand-600 text-white px-2 py-0.5 rounded">You</span>
                                  )}
                                </span>
                                {user.categories.length > 0 && (
                                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                    {user.categories.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                            <span className="text-base sm:text-lg font-bold text-brand-600 dark:text-brand-400">
                              {user.averageQuizScore}%
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                              {user.performanceScore}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm">
                            {user.totalModulesCompleted}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm">
                            {user.totalQuizAttempts}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                              user.passRate >= 80 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : user.passRate >= 60
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                              {user.passRate}%
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Your Rank Highlight (if not in visible list) */}
            {currentUserRank && currentUserRank.rank > 10 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-8 bg-brand-50 dark:bg-brand-900/20 border-2 border-brand-300 dark:border-brand-700 rounded-xl p-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                      {profilePictures[currentUserRank.userId] ? (
                        <img 
                          src={profilePictures[currentUserRank.userId]} 
                          alt={currentUserRank.displayName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : null}
                      {!profilePictures[currentUserRank.userId] && (
                        <span>{getInitials(currentUserRank.displayName)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        Your Rank
                        <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
                          #{currentUserRank.rank}
                        </span>
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Keep learning to climb higher!</p>
                    </div>
                  </div>
                  <div className="flex gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                        {currentUserRank.averageQuizScore}%
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">Avg Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-neutral-700 dark:text-neutral-300">
                        {currentUserRank.performanceScore}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">Points</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-neutral-700 dark:text-neutral-300">
                        {currentUserRank.totalModulesCompleted}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">Modules</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
          )}
        </div>
      </div>
    </>
  );
}
