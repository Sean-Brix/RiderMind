import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Users, TrendingUp, Award, BookOpen, MessageSquare, ThumbsUp, 
  Target, CheckCircle, Clock, Trophy, ChevronDown, Activity, Heart, ThumbsDown
} from 'lucide-react';
import { 
  getAccountsAnalytics,
  getLeaderboardAnalytics,
  getQuizzesAnalytics,
  getModulesAnalytics,
  getModuleFeedbackAnalytics,
  getQuizReactionAnalytics
} from '../../../../services/analyticsService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const [viewMode, setViewMode] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // All analytics data
  const [accountsData, setAccountsData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [quizzesData, setQuizzesData] = useState(null);
  const [modulesData, setModulesData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [reactionsData, setReactionsData] = useState(null);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [accounts, leaderboard, quizzes, modules, feedback, reactions] = await Promise.all([
        getAccountsAnalytics(),
        getLeaderboardAnalytics(10),
        getQuizzesAnalytics(),
        getModulesAnalytics(),
        getModuleFeedbackAnalytics(),
        getQuizReactionAnalytics()
      ]);

      setAccountsData(accounts);
      setLeaderboardData(leaderboard);
      setQuizzesData(quizzes);
      setModulesData(modules);
      setFeedbackData(feedback);
      setReactionsData(reactions);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Monitor platform performance and user engagement
          </p>
        </div>
        
        <div className="relative">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="appearance-none px-4 py-2 pr-10 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent cursor-pointer"
          >
            <option value="overview">Overview</option>
            <option value="users">Users & Accounts</option>
            <option value="learning">Learning Progress</option>
            <option value="engagement">Engagement & Feedback</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Bento Grid Layout */}
      {viewMode === 'overview' && (
        <OverviewGrid 
          accounts={accountsData}
          leaderboard={leaderboardData}
          quizzes={quizzesData}
          modules={modulesData}
          feedback={feedbackData}
          reactions={reactionsData}
        />
      )}

      {viewMode === 'users' && (
        <UsersView accounts={accountsData} leaderboard={leaderboardData} />
      )}

      {viewMode === 'learning' && (
        <LearningView quizzes={quizzesData} modules={modulesData} />
      )}

      {viewMode === 'engagement' && (
        <EngagementView feedback={feedbackData} reactions={reactionsData} />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, change, size = 'default', trend, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all hover:scale-[1.02] backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={`text-xs mt-2 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
            </p>
          )}
          {trend && (
            <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">{trend}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}

// Overview Grid Component
function OverviewGrid({ accounts, leaderboard, quizzes, modules, feedback, reactions }) {
  const totalUsers = accounts?.total || 0;
  const activeUsers = accounts?.active || 0;
  const totalModules = modules?.totalModules || 0;
  const totalQuizzes = quizzes?.totalQuizzes || 0;
  const quizPassRate = quizzes?.passRate || 0;
  const moduleCompletionRate = modules?.completionRate || 0;
  const avgQuizScore = quizzes?.averageScore || 0;
  const feedbackScore = feedback?.avgRating || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Row 1: Key Stats (4 small cards) */}
      <StatCard
        title="Total Users"
        value={totalUsers}
        icon={Users}
        color="blue"
        trend={`${activeUsers} active`}
      />
      <StatCard
        title="Module Completion"
        value={`${moduleCompletionRate.toFixed(1)}%`}
        icon={CheckCircle}
        color="green"
        trend={`${modules?.completedModules || 0} completed`}
      />
      <StatCard
        title="Quiz Pass Rate"
        value={`${quizPassRate.toFixed(1)}%`}
        icon={Target}
        color="purple"
        trend={`${quizzes?.passedAttempts || 0} passed`}
      />
      <StatCard
        title="Avg Feedback"
        value={feedbackScore.toFixed(1)}
        icon={Heart}
        color="orange"
        trend={`${feedback?.totalFeedback || 0} responses`}
      />

      {/* Row 2: Growth Chart (spans 2 columns) + 2 small stats */}
      <div className="md:col-span-2 bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth (12 Months)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={accounts?.growth || []}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <StatCard
        title="Total Modules"
        value={totalModules}
        icon={BookOpen}
        color="blue"
        trend={`${modules?.totalEnrollments || 0} enrollments`}
      />
      <StatCard
        title="Total Quizzes"
        value={totalQuizzes}
        icon={Award}
        color="purple"
        trend={`${quizzes?.totalAttempts || 0} attempts`}
      />

      {/* Row 3: Leaderboard (spans 2 columns) + Feedback Distribution */}
      <div className="md:col-span-2 bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Performers
        </h3>
        <div className="space-y-2">
          {leaderboard && leaderboard.length > 0 ? (
            leaderboard.slice(0, 5).map((student, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {student.modules} modules • {student.quizzes} quizzes
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-600 dark:text-brand-400">{student.score}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{student.avgScore}% avg</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No leaderboard data yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-2 bg-gradient-to-br from-white via-purple-50 to-indigo-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Feedback Sentiment</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={[
                { name: 'Positive', value: feedback?.positive || 0, color: '#10b981' },
                { name: 'Neutral', value: feedback?.neutral || 0, color: '#f59e0b' },
                { name: 'Negative', value: feedback?.negative || 0, color: '#ef4444' },
              ]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {[
                { color: '#10b981' },
                { color: '#f59e0b' },
                { color: '#ef4444' },
              ].map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Row 4: Quiz Reactions */}
      <div className="md:col-span-2 bg-gradient-to-br from-white via-indigo-50 to-violet-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quiz Reactions</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-green-100 dark:bg-green-900/20 rounded-full">
              <ThumbsUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{reactions?.likes || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Likes</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-red-100 dark:bg-red-900/20 rounded-full">
              <ThumbsDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{reactions?.dislikes || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Dislikes</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {reactions?.likePercentage ? reactions.likePercentage.toFixed(1) : 0}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Like Rate</p>
          </div>
        </div>
      </div>

      <StatCard
        title="Avg Quiz Score"
        value={`${avgQuizScore.toFixed(1)}%`}
        icon={Target}
        color="blue"
      />
      <StatCard
        title="New Users"
        value={accounts?.newThisMonth || 0}
        icon={TrendingUp}
        color="green"
        trend="This month"
      />
    </div>
  );
}

// Users View Component
function UsersView({ accounts, leaderboard }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Users"
        value={accounts?.total || 0}
        icon={Users}
        color="blue"
      />
      <StatCard
        title="Active Users"
        value={accounts?.active || 0}
        icon={Activity}
        color="green"
      />
      <StatCard
        title="Inactive Users"
        value={accounts?.inactive || 0}
        icon={Clock}
        color="orange"
      />
      <StatCard
        title="New This Month"
        value={accounts?.newThisMonth || 0}
        icon={TrendingUp}
        color="purple"
      />

      {/* User Growth Chart */}
      <div className="md:col-span-4 bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={accounts?.growth || []}>
            <defs>
              <linearGradient id="colorUsers2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers2)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Role Distribution */}
      <div className="md:col-span-2 bg-gradient-to-br from-white via-indigo-50 to-blue-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Role Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={accounts?.roleDistribution || []}
              dataKey="count"
              nameKey="role"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => `${entry.role}: ${entry.count}`}
            >
              {(accounts?.roleDistribution || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Status Distribution */}
      <div className="md:col-span-2 bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={accounts?.statusDistribution || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="status" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Full Leaderboard */}
      <div className="md:col-span-4 bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Complete Leaderboard
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modules</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quizzes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Score</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboard && leaderboard.length > 0 ? (
                leaderboard.map((student) => (
                  <tr key={student.rank} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {student.rank <= 3 && (
                          <span className="text-xl">
                            {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">#{student.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-medium">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-brand-600 dark:text-brand-400">{student.score}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                        Level {student.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{student.modules}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{student.quizzes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 dark:text-green-400 font-medium">{student.avgScore}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No leaderboard data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Learning View Component
function LearningView({ quizzes, modules }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Modules"
        value={modules?.totalModules || 0}
        icon={BookOpen}
        color="blue"
      />
      <StatCard
        title="Module Completion"
        value={`${(modules?.completionRate || 0).toFixed(1)}%`}
        icon={CheckCircle}
        color="green"
        trend={`${modules?.completedModules || 0}/${modules?.totalEnrollments || 0}`}
      />
      <StatCard
        title="Total Quizzes"
        value={quizzes?.totalQuizzes || 0}
        icon={Award}
        color="purple"
      />
      <StatCard
        title="Quiz Pass Rate"
        value={`${(quizzes?.passRate || 0).toFixed(1)}%`}
        icon={Target}
        color="green"
        trend={`${quizzes?.passedAttempts || 0}/${quizzes?.totalAttempts || 0}`}
      />

      {/* Module Performance */}
      <div className="md:col-span-4 bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Module Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={modules?.modulePerformance || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="enrollments" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quiz Performance */}
      <div className="md:col-span-4 bg-gradient-to-br from-white via-purple-50 to-violet-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quiz Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={quizzes?.quizPerformance || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="attempts" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="passed" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Skill Level Distribution */}
      <div className="md:col-span-2 bg-gradient-to-br from-white via-purple-50 to-indigo-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skill Level Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={modules?.skillLevelDistribution || []}
              dataKey="count"
              nameKey="level"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => `${entry.level}: ${entry.count}`}
            >
              {(modules?.skillLevelDistribution || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Difficulty Distribution */}
      <div className="md:col-span-2 bg-gradient-to-br from-white via-indigo-50 to-purple-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quiz Difficulty Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={quizzes?.difficultyDistribution || []}
              dataKey="count"
              nameKey="difficulty"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => `${entry.difficulty}: ${entry.count}`}
            >
              {(quizzes?.difficultyDistribution || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Average Stats */}
      <StatCard
        title="Avg Quiz Score"
        value={`${(quizzes?.averageScore || 0).toFixed(1)}%`}
        icon={Target}
        color="blue"
      />
      <StatCard
        title="Avg Module Progress"
        value={`${(modules?.averageProgress || 0).toFixed(1)}%`}
        icon={Activity}
        color="purple"
      />
      <StatCard
        title="Total Enrollments"
        value={modules?.totalEnrollments || 0}
        icon={Users}
        color="green"
      />
      <StatCard
        title="Total Attempts"
        value={quizzes?.totalAttempts || 0}
        icon={Clock}
        color="orange"
      />
    </div>
  );
}

// Engagement View Component
function EngagementView({ feedback, reactions }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Feedback"
        value={feedback?.totalFeedback || 0}
        icon={MessageSquare}
        color="blue"
      />
      <StatCard
        title="Positive Sentiment"
        value={feedback?.positive || 0}
        icon={ThumbsUp}
        color="green"
        trend={`${((feedback?.positive / feedback?.totalFeedback * 100) || 0).toFixed(1)}%`}
      />
      <StatCard
        title="Average Rating"
        value={(feedback?.avgRating || 0).toFixed(1)}
        icon={Award}
        color="purple"
        trend="Out of 5.0"
      />
      <StatCard
        title="Total Reactions"
        value={reactions?.totalReactions || 0}
        icon={Heart}
        color="orange"
      />

      {/* Sentiment Trend */}
      <div className="md:col-span-4 bg-gradient-to-br from-white via-blue-50 to-violet-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sentiment Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={feedback?.sentimentTrend || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="neutral" stroke="#f59e0b" strokeWidth={2} />
            <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sentiment Distribution */}
      <div className="md:col-span-2 bg-gradient-to-br from-white via-purple-50 to-indigo-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sentiment Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={[
                { name: 'Positive', value: feedback?.positive || 0, color: '#10b981' },
                { name: 'Neutral', value: feedback?.neutral || 0, color: '#f59e0b' },
                { name: 'Negative', value: feedback?.negative || 0, color: '#ef4444' },
              ]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {[
                { color: '#10b981' },
                { color: '#f59e0b' },
                { color: '#ef4444' },
              ].map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Rating Distribution */}
      <div className="md:col-span-2 bg-gradient-to-br from-white via-indigo-50 to-blue-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rating Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={feedback?.ratingDistribution || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="rating" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="md:col-span-4 bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Feedback by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={feedback?.categoryBreakdown || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="category" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Quizzes by Reactions */}
      <div className="md:col-span-4 bg-gradient-to-br from-white via-purple-50 to-indigo-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Quizzes by Reactions</h3>
        <div className="space-y-3">
          {reactions?.topQuizzes && reactions.topQuizzes.length > 0 ? (
            reactions.topQuizzes.slice(0, 5).map((quiz, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{quiz.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{quiz.category}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{quiz.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsDown className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{quiz.dislikes}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No reaction data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Reaction Stats */}
      <StatCard
        title="Total Likes"
        value={reactions?.likes || 0}
        icon={ThumbsUp}
        color="green"
      />
      <StatCard
        title="Total Dislikes"
        value={reactions?.dislikes || 0}
        icon={ThumbsDown}
        color="red"
      />
      <StatCard
        title="Like Percentage"
        value={`${(reactions?.likePercentage || 0).toFixed(1)}%`}
        icon={Activity}
        color="blue"
      />
      <StatCard
        title="Neutral Feedback"
        value={feedback?.neutral || 0}
        icon={MessageSquare}
        color="orange"
      />
    </div>
  );
}

// Accounts Analytics Component
function AccountsAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAccountsAnalytics();
        setData(result);
      } catch (err) {
        console.error('Error fetching accounts analytics:', err);
        setError('Failed to load accounts analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-3"></div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Loading accounts data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) return null;
  
  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Users" value={data.total.toLocaleString()} icon="👥" color="blue" />
        <StatCard title="Active Users" value={data.active.toLocaleString()} icon="✅" color="green" />
        <StatCard title="Inactive Users" value={data.inactive.toLocaleString()} icon="💤" color="gray" />
        <StatCard title="New This Month" value={`+${data.newThisMonth}`} icon="📈" color="purple" />
      </div>

      {data.total === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8">
          <div className="text-center">
            <div className="text-5xl mb-3">📊</div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Insufficient Data</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Not enough data to display graphs yet. Add more users to see visualizations.</p>
          </div>
        </div>
      ) : (
        <>
      {/* Growth Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">User Growth Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.growth}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '11px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ color: '#111827', fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Role Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.roleDistribution}
                dataKey="count"
                nameKey="role"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={(entry) => `${entry.role}: ${entry.count}`}
                style={{ fontSize: '11px' }}
              >
                {data.roleDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.statusDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="status" stroke="#6b7280" style={{ fontSize: '11px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

// Leaderboard Analytics Component
function LeaderboardAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getLeaderboardAnalytics(10);
        setData(result);
      } catch (err) {
        console.error('Error fetching leaderboard analytics:', err);
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-3"></div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Top 10 Students</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase">Rank</th>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase">Student</th>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase">Score</th>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase">Level</th>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase">Modules</th>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase">Quizzes</th>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase">Avg Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {!data || data.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-3 py-12">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🏆</div>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Insufficient Data</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">No student activity to display yet.</p>
                  </div>
                </td>
              </tr>
            ) : data.map((student) => (
              <tr key={student.rank} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {student.rank <= 3 && (
                      <span className="text-base">
                        {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : '🥉'}
                      </span>
                    )}
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">#{student.rank}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">{student.name}</div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="font-semibold text-brand-600 dark:text-brand-400">{student.score.toLocaleString()}</div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    Level {student.level}
                  </span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-neutral-600 dark:text-neutral-400">{student.modules}</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-neutral-600 dark:text-neutral-400">{student.quizzes}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="font-medium text-green-600 dark:text-green-400">{student.avgScore}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Quizzes Analytics Component
function QuizzesAnalytics({ selectedQuizId, setSelectedQuizId }) {
  const [data, setData] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [quizReactions, setQuizReactions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [loadingReactions, setLoadingReactions] = useState(false);
  const [error, setError] = useState(null);

  // Fetch quiz analytics overview
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getQuizzesAnalytics();
        setData(result);
      } catch (err) {
        console.error('Error fetching quizzes analytics:', err);
        setError('Failed to load quizzes analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch all quizzes on mount
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoadingQuizzes(true);
      setError(null);
      try {
        const result = await getAllQuizzes();
        setQuizzes(result);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Failed to load quizzes');
      } finally {
        setLoadingQuizzes(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Find selected quiz from real data
  const selectedQuiz = quizzes.find(q => q.id === selectedQuizId);

  // Fetch quiz reactions when a quiz is selected
  useEffect(() => {
    const fetchQuizReactions = async () => {
      if (!selectedQuizId) {
        setQuizReactions(null);
        return;
      }

      setLoadingReactions(true);
      try {
        const result = await getQuizReactions(selectedQuizId);
        setQuizReactions(result);
      } catch (err) {
        console.error('Error fetching quiz reactions:', err);
        setQuizReactions(null);
      } finally {
        setLoadingReactions(false);
      }
    };

    fetchQuizReactions();
  }, [selectedQuizId]);

  if (loading || loadingQuizzes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-3"></div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) return null;
  
  return (
    <div className="flex gap-4">
      {/* Left Sidebar - Quiz List */}
      <div className="w-64 flex-shrink-0">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 sticky top-6">
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wide">
              Select Quiz
            </h3>
          </div>
          
          <div className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            <button
              onClick={() => setSelectedQuizId(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors mb-1 ${
                !selectedQuizId
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              📊 All Quizzes Overview
            </button>
            
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => setSelectedQuizId(quiz.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                    selectedQuizId === quiz.id
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-medium'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`}
                >
                  <div className="font-medium truncate">{quiz.title || quiz.name}</div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-500 mt-0.5">
                    {quiz.passingScore || 70}% passing • {quiz._count?.questions || 0} questions
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-4 text-neutral-500 dark:text-neutral-400 text-xs">
                No quizzes found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {!selectedQuizId ? (
          // All Quizzes Overview
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard title="Total Quizzes" value={data.totalQuizzes} icon="📝" color="blue" />
              <StatCard title="Total Attempts" value={data.totalAttempts.toLocaleString()} icon="🎯" color="purple" />
              <StatCard title="Average Score" value={`${data.avgScore}%`} icon="📊" color="green" />
              <StatCard title="Pass Rate" value={`${data.passRate}%`} icon="✅" color="orange" />
            </div>

            {data.totalQuizzes === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8">
                <div className="text-center">
                  <div className="text-5xl mb-3">📝</div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Insufficient Data</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Not enough quiz data to display visualizations yet.</p>
                </div>
              </div>
            ) : (
              <>
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Attempts Over Time */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Quiz Attempts Over Time</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={data.attemptsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" stroke="#6b7280" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="attempts" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Score Distribution */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Score Distribution</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="range" stroke="#6b7280" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Performance */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Category Performance</h3>
              <div className="space-y-3">
                {data.categoryPerformance.map((cat) => (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">{cat.category}</span>
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">{cat.avgScore}% avg</span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
                      <div className="bg-brand-600 h-1.5 rounded-full transition-all" style={{ width: `${cat.avgScore}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-500 dark:text-neutral-400">
                      <span>{cat.attempts.toLocaleString()} attempts</span>
                      <span>{cat.passRate}% pass rate</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
              </>
            )}
          </div>
        ) : (
          // Individual Quiz Stats
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">{selectedQuiz?.title || selectedQuiz?.name}</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {selectedQuiz?._count?.questions || 0} questions • {selectedQuiz?.passingScore || 70}% passing score
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <StatCard title="Questions" value={selectedQuiz?._count?.questions || 0} icon="❓" color="blue" />
              <StatCard title="Passing Score" value={`${selectedQuiz?.passingScore || 70}%`} icon="📊" color="green" />
              <StatCard title="Duration" value={`${selectedQuiz?.timeLimit || 'N/A'} min`} icon="⏱️" color="orange" />
            </div>

            {/* Question Reactions */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Question Reactions</h3>
              
              {loadingReactions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-2"></div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Loading reactions...</p>
                  </div>
                </div>
              ) : quizReactions && quizReactions.questions && quizReactions.questions.length > 0 ? (
                <div className="space-y-3">
                  {quizReactions.questions.map((question, index) => {
                    const totalReactions = question.totalReactions;
                    const likePercentage = totalReactions > 0 ? (question.totalLikes / totalReactions * 100).toFixed(0) : 0;
                    
                    return (
                      <div key={question.questionId} className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-brand-700 dark:text-brand-400">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2">{question.questionText}</p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                                <span className="text-xs font-semibold text-green-600 dark:text-green-400">{question.totalLikes}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                </svg>
                                <span className="text-xs font-semibold text-red-600 dark:text-red-400">{question.totalDislikes}</span>
                              </div>
                              <div className="ml-auto">
                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  likePercentage >= 75 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  likePercentage >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {likePercentage}% liked
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400 text-xs">
                  No reactions for this quiz yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Feedback Analytics Component
function FeedbackAnalytics({ data }) {
  const [moduleFeedbackData, setModuleFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedbackData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getModuleFeedbackAnalytics();
        setModuleFeedbackData(result);
      } catch (err) {
        console.error('Error fetching feedback data:', err);
        setError('Failed to load feedback data');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackData();
  }, []);
  
  const sentimentData = moduleFeedbackData ? [
    { name: 'Positive', value: moduleFeedbackData.positive, color: '#10b981' },
    { name: 'Neutral', value: moduleFeedbackData.neutral, color: '#f59e0b' },
    { name: 'Negative', value: moduleFeedbackData.negative, color: '#ef4444' }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-3"></div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Loading feedback data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!moduleFeedbackData) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Module Feedback Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Feedback" value={moduleFeedbackData.totalFeedback.toLocaleString()} icon="💬" color="blue" />
        <StatCard title="Positive" value={moduleFeedbackData.positive.toLocaleString()} icon="👍" color="green" />
        <StatCard title="Neutral" value={moduleFeedbackData.neutral.toLocaleString()} icon="😐" color="yellow" />
        <StatCard title="Negative" value={moduleFeedbackData.negative.toLocaleString()} icon="👎" color="red" />
      </div>

      {moduleFeedbackData.totalFeedback === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8">
          <div className="text-center">
            <div className="text-5xl mb-3">💬</div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Insufficient Data</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">No module feedback has been submitted yet.</p>
          </div>
        </div>
      ) : (
        <>
      {/* Average Rating and Sentiment Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Average Rating</h3>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-5xl font-bold text-brand-600 dark:text-brand-400 mb-2">{moduleFeedbackData.avgRating}</div>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-2xl">
                  {star <= Math.round(moduleFeedbackData.avgRating) ? '⭐' : '☆'}
                </span>
              ))}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">out of 5 stars</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
              Based on {moduleFeedbackData.totalFeedback} reviews
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sentimentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={(entry) => `${entry.name}: ${entry.value}`}
                style={{ fontSize: '11px' }}
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sentiment Trend */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Sentiment Trend Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={moduleFeedbackData.sentimentTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '11px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
            <Line type="monotone" dataKey="neutral" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
            <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Rating Distribution & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={moduleFeedbackData.ratingDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" style={{ fontSize: '11px' }} />
              <YAxis dataKey="stars" type="category" stroke="#6b7280" style={{ fontSize: '11px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="count" fill="#f59e0b" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Category Breakdown</h3>
          <div className="space-y-2">
            {moduleFeedbackData.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                <div>
                  <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100">{cat.category}</div>
                  <div className="text-[10px] text-neutral-600 dark:text-neutral-400">{cat.count} feedback</div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">{cat.avgRating}</span>
                  <span className="text-yellow-500">⭐</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

// Modules Analytics Component
function ModulesAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getModulesAnalytics();
        setData(result);
      } catch (err) {
        console.error('Error fetching modules analytics:', err);
        setError('Failed to load modules analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-3"></div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Loading modules data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Modules" value={data.totalModules} icon="📚" color="blue" />
        <StatCard title="Total Enrollments" value={data.totalEnrollments.toLocaleString()} icon="👨‍🎓" color="purple" />
        <StatCard title="Avg Completion" value={`${data.avgCompletionRate}%`} icon="✅" color="green" />
        <StatCard title="Avg Time" value={data.avgTimeToComplete} icon="⏱️" color="orange" />
      </div>

      {data.totalModules === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8">
          <div className="text-center">
            <div className="text-5xl mb-3">📚</div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Insufficient Data</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Not enough module data to display visualizations yet.</p>
          </div>
        </div>
      ) : (
        <>
      {/* Enrollment Trend */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Enrollment Trend Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.enrollmentTrend}>
            <defs>
              <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '11px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
            <Area type="monotone" dataKey="enrollments" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorEnrollments)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category & Skill Level Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Completion by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.completionByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" stroke="#6b7280" style={{ fontSize: '11px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="avgCompletion" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Skill Level Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.skillLevelDistribution}
                dataKey="enrollments"
                nameKey="level"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={(entry) => `${entry.level}: ${entry.enrollments}`}
                style={{ fontSize: '11px' }}
              >
                {data.skillLevelDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Modules */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Top Performing Modules</h3>
        <div className="space-y-2">
          {data.topModules.map((module, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
              <div className="flex-1">
                <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100">{module.name}</div>
                <div className="text-[10px] text-neutral-600 dark:text-neutral-400">{module.enrollments} enrollments</div>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <div className="text-xs font-medium text-green-600 dark:text-green-400">{module.completionRate}%</div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400">Completion</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-400">{module.avgScore}%</div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400">Avg Score</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}
    </div>
  );
}



