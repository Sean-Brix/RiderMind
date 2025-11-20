import { useState } from 'react';
import Navbar from '../../../../components/Navbar';

// Mock modules data
const MODULES = [
  { id: 'all', name: 'All Modules' },
  { id: 1, name: 'Road Safety Basics' },
  { id: 2, name: 'Traffic Signs & Signals' },
  { id: 3, name: 'Defensive Riding Techniques' },
  { id: 4, name: 'Motorcycle Maintenance' },
  { id: 5, name: 'Weather & Road Conditions' },
  { id: 6, name: 'Emergency Procedures' },
  { id: 7, name: 'Legal Requirements' },
  { id: 8, name: 'Advanced Riding Skills' },
];

// Mock leaderboard data
const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Juan dela Cruz', score: 98, completedModules: 8, totalQuizzes: 24, avatar: 'JD' },
  { rank: 2, name: 'Maria Santos', score: 96, completedModules: 8, totalQuizzes: 24, avatar: 'MS' },
  { rank: 3, name: 'Pedro Reyes', score: 94, completedModules: 8, totalQuizzes: 23, avatar: 'PR' },
  { rank: 4, name: 'Ana Garcia', score: 92, completedModules: 7, totalQuizzes: 21, avatar: 'AG' },
  { rank: 5, name: 'Jose Rizal', score: 90, completedModules: 7, totalQuizzes: 21, avatar: 'JR' },
  { rank: 6, name: 'Rosa Martinez', score: 88, completedModules: 7, totalQuizzes: 20, avatar: 'RM' },
  { rank: 7, name: 'Carlos Lopez', score: 86, completedModules: 6, totalQuizzes: 18, avatar: 'CL' },
  { rank: 8, name: 'Linda Flores', score: 84, completedModules: 6, totalQuizzes: 18, avatar: 'LF' },
  { rank: 9, name: 'Miguel Torres', score: 82, completedModules: 6, totalQuizzes: 17, avatar: 'MT' },
  { rank: 10, name: 'Sofia Diaz', score: 80, completedModules: 5, totalQuizzes: 15, avatar: 'SD' },
];

export default function Leaderboard() {
  const [selectedModule, setSelectedModule] = useState('all');
  const [timeFrame, setTimeFrame] = useState('all-time'); // 'weekly', 'monthly', 'all-time'

  // Get podium (top 3)
  const podium = MOCK_LEADERBOARD.slice(0, 3);
  const restOfLeaderboard = MOCK_LEADERBOARD.slice(3);

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Leaderboard</h1>
            <p className="text-brand-100 text-lg max-w-2xl mx-auto">
              See how you rank against other riders in the RiderMind community
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Module Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Filter by Module
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                {MODULES.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Frame Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Time Frame
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeFrame('weekly')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    timeFrame === 'weekly'
                      ? 'bg-brand-600 text-white'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimeFrame('monthly')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    timeFrame === 'monthly'
                      ? 'bg-brand-600 text-white'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setTimeFrame('all-time')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    timeFrame === 'all-time'
                      ? 'bg-brand-600 text-white'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>
          </div>

          {/* Podium (Top 3) */}
          <div className="mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 text-center">
              🏆 Top Performers
            </h2>
            <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-8">
              {podium.map((user) => (
                <div key={user.rank} className={`flex flex-col items-center ${getPodiumPosition(user.rank)} flex-1 max-w-[140px]`}>
                  {/* Avatar */}
                  <div className={`relative mb-2 md:mb-4 ${user.rank === 1 ? 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28' : 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24'}`}>
                    <div className={`w-full h-full bg-gradient-to-br ${getMedalColor(user.rank)} rounded-full flex items-center justify-center text-white font-bold ${user.rank === 1 ? 'text-3xl' : 'text-2xl'} shadow-lg`}>
                      {user.avatar}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-white dark:bg-neutral-800 rounded-full p-2 shadow-lg">
                      <span className="text-2xl">
                        {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                      </span>
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className={`font-bold text-neutral-900 dark:text-neutral-100 mb-1 text-center text-xs sm:text-sm ${user.rank === 1 ? 'md:text-xl' : 'md:text-lg'}`}>
                    {user.name}
                  </h3>

                  {/* Score */}
                  <div className={`font-bold mb-2 ${user.rank === 1 ? 'text-lg sm:text-xl md:text-2xl text-brand-600 dark:text-brand-400' : 'text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-400'}`}>
                    {user.score}%
                  </div>

                  {/* Stats */}
                  <div className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400 text-center mb-2 md:mb-4">
                    <div className="hidden sm:block">{user.completedModules} modules</div>
                    <div className="hidden sm:block">{user.totalQuizzes} quizzes</div>
                    <div className="sm:hidden">{user.completedModules}M</div>
                  </div>

                  {/* Podium Block */}
                  <div className={`w-full sm:w-28 md:w-32 ${getPodiumHeight(user.rank)} bg-gradient-to-br ${getMedalColor(user.rank)} rounded-t-lg shadow-lg flex items-center justify-center`}>
                    <span className="text-white font-bold text-2xl sm:text-3xl md:text-4xl">#{user.rank}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rest of Leaderboard */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-neutral-100 dark:bg-neutral-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">Rank</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">Rider</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">Score</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">Modules</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">Quizzes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {restOfLeaderboard.map((user) => (
                    <tr key={user.rank} className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        #{user.rank}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                            {user.avatar}
                          </div>
                          <span className="font-medium text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                        <span className="text-base sm:text-lg font-bold text-brand-600 dark:text-brand-400">
                          {user.score}%
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm">
                        {user.completedModules}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm">
                        {user.totalQuizzes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Your Rank (if not in top 10) */}
          <div className="mt-8 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  YU
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Your Rank</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Keep learning to climb higher!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">#15</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Score: 75%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
