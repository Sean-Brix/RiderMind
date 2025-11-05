import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import mockData from '../../../../data/mockAnalytics.json';
import { getModuleFeedbackAnalytics, getQuizReactions } from '../../../../services/analyticsService';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  return (
    <div className="p-6 space-y-4">
      {/* Tabs */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-1 flex gap-1">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex-1 px-3 py-2 rounded-md font-medium text-xs transition-colors ${
            activeTab === 'accounts'
              ? 'bg-brand-600 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
          }`}
        >
          Accounts
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 px-3 py-2 rounded-md font-medium text-xs transition-colors ${
            activeTab === 'leaderboard'
              ? 'bg-brand-600 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
          }`}
        >
          Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex-1 px-3 py-2 rounded-md font-medium text-xs transition-colors ${
            activeTab === 'quizzes'
              ? 'bg-brand-600 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
          }`}
        >
          Quizzes
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 px-3 py-2 rounded-md font-medium text-xs transition-colors ${
            activeTab === 'feedback'
              ? 'bg-brand-600 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
          }`}
        >
          Feedback
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`flex-1 px-3 py-2 rounded-md font-medium text-xs transition-colors ${
            activeTab === 'modules'
              ? 'bg-brand-600 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
          }`}
        >
          Modules
        </button>
      </div>

      {/* Accounts Tab */}
      {activeTab === 'accounts' && <AccountsAnalytics data={mockData.accounts} />}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && <LeaderboardAnalytics data={mockData.leaderboard} />}

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && <QuizzesAnalytics data={mockData.quizzes} selectedQuizId={selectedQuizId} setSelectedQuizId={setSelectedQuizId} />}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && <FeedbackAnalytics data={mockData.feedback} />}

      {/* Modules Tab */}
      {activeTab === 'modules' && <ModulesAnalytics data={mockData.modules} />}
    </div>
  );
}

// Accounts Analytics Component
function AccountsAnalytics({ data }) {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Users" value={data.total.toLocaleString()} icon="👥" color="blue" />
        <StatCard title="Active Users" value={data.active.toLocaleString()} icon="✅" color="green" />
        <StatCard title="Inactive Users" value={data.inactive.toLocaleString()} icon="💤" color="gray" />
        <StatCard title="New This Month" value={`+${data.newThisMonth}`} icon="📈" color="purple" />
      </div>

      {/* Growth Chart */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
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
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
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
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
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
    </div>
  );
}

// Leaderboard Analytics Component
function LeaderboardAnalytics({ data }) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
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
            {data.map((student) => (
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
function QuizzesAnalytics({ data, selectedQuizId, setSelectedQuizId }) {
  const [quizReactions, setQuizReactions] = useState(null);
  const [loadingReactions, setLoadingReactions] = useState(false);
  
  const selectedQuiz = data.topQuizzes.find(q => q.name === selectedQuizId);

  // Fetch quiz reactions when a quiz is selected
  useEffect(() => {
    const fetchQuizReactions = async () => {
      if (!selectedQuizId || !selectedQuiz) {
        setQuizReactions(null);
        return;
      }

      // For now, we need the quiz ID, but the mock data only has names
      // In production, we'd pass quiz.id instead of quiz.name
      // This is a temporary solution - skipping API call until we have real quiz IDs
      setLoadingReactions(false);
      setQuizReactions(null);
    };

    fetchQuizReactions();
  }, [selectedQuizId, selectedQuiz]);
  
  return (
    <div className="flex gap-4">
      {/* Left Sidebar - Quiz List */}
      <div className="w-64 flex-shrink-0">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 sticky top-6">
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
            
            {data.topQuizzes.map((quiz, index) => (
              <button
                key={index}
                onClick={() => setSelectedQuizId(quiz.name)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                  selectedQuizId === quiz.name
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                <div className="font-medium truncate">{quiz.name}</div>
                <div className="text-[10px] text-neutral-500 dark:text-neutral-500 mt-0.5">
                  {quiz.attempts} attempts • {quiz.avgScore}% avg
                </div>
              </button>
            ))}
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

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Attempts Over Time */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
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
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
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
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
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
          </div>
        ) : (
          // Individual Quiz Stats
          <div className="space-y-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">{selectedQuiz.name}</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Detailed Statistics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <StatCard title="Attempts" value={selectedQuiz.attempts} icon="🎯" color="blue" />
              <StatCard title="Avg Score" value={`${selectedQuiz.avgScore}%`} icon="📊" color="green" />
              <StatCard title="Pass Rate" value={`${selectedQuiz.passRate}%`} icon="✅" color="orange" />
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Performance Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">Excellent (90-100%)</span>
                  </div>
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">
                    {Math.floor(selectedQuiz.attempts * (selectedQuiz.avgScore / 100 * 0.3))}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👍</span>
                    <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">Good (75-89%)</span>
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {Math.floor(selectedQuiz.attempts * (selectedQuiz.avgScore / 100 * 0.4))}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">😐</span>
                    <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">Average (60-74%)</span>
                  </div>
                  <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
                    {Math.floor(selectedQuiz.attempts * (selectedQuiz.avgScore / 100 * 0.2))}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📉</span>
                    <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">Poor (&lt;60%)</span>
                  </div>
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">
                    {Math.floor(selectedQuiz.attempts * (selectedQuiz.avgScore / 100 * 0.1))}
                  </span>
                </div>
              </div>
            </div>

            {/* Question Reactions */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
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

      {/* Average Rating and Sentiment Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
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
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
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
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
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
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
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
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
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
    </div>
  );
}

// Modules Analytics Component
function ModulesAnalytics({ data }) {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Modules" value={data.totalModules} icon="📚" color="blue" />
        <StatCard title="Total Enrollments" value={data.totalEnrollments.toLocaleString()} icon="👨‍🎓" color="purple" />
        <StatCard title="Avg Completion" value={`${data.avgCompletionRate}%`} icon="✅" color="green" />
        <StatCard title="Avg Time" value={data.avgTimeToComplete} icon="⏱️" color="orange" />
      </div>

      {/* Enrollment Trend */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
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
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
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
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
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
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
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
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, icon, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    gray: 'bg-neutral-50 dark:bg-neutral-900/20 border-neutral-200 dark:border-neutral-800'
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-0.5">{value}</div>
      <div className="text-xs text-neutral-600 dark:text-neutral-400">{title}</div>
    </div>
  );
}
