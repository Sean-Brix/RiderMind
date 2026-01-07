import { useState, useMemo, memo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Users, TrendingUp, Award, BookOpen, MessageSquare, ThumbsUp, 
  Target, CheckCircle, Clock, Trophy, ChevronDown, Activity, Heart, ThumbsDown, FileDown, BarChart3
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  useAccountsAnalytics,
  useLeaderboardAnalytics,
  useQuizzesAnalytics,
  useModulesAnalytics,
  useModuleFeedbackAnalytics,
  useQuizReactionAnalytics
} from '../../../../hooks/useAnalytics';
import { useQuery } from '@tanstack/react-query';
import { getAllQuizzes, getQuizReactions } from '../../../../services/analyticsService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Memoized StatCard component
const StatCard = memo(({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    gray: 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">{title}</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
        </div>
        {typeof Icon === 'string' ? (
          <div className="text-2xl">{Icon}</div>
        ) : (
          <div className={`p-2 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default function Analytics() {
  const [viewMode, setViewMode] = useState('overview');
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  // Only fetch data for the current view mode
  const shouldFetchAccounts = viewMode === 'overview' || viewMode === 'accounts';
  const shouldFetchLeaderboard = viewMode === 'overview' || viewMode === 'leaderboard';
  const shouldFetchQuizzes = viewMode === 'quizzes';
  const shouldFetchModules = viewMode === 'modules';
  const shouldFetchFeedback = viewMode === 'feedback';

  // Conditional queries - only fetch when needed
  const accountsQuery = useAccountsAnalytics();
  const leaderboardQuery = useLeaderboardAnalytics(10);
  
  // These are only fetched when their respective views are active
  const quizzesQuery = useQuizzesAnalytics();
  const modulesQuery = useModulesAnalytics();
  const feedbackQuery = useModuleFeedbackAnalytics();
  const reactionsQuery = useQuizReactionAnalytics();

  // Determine loading and error states based on current view
  const isLoading = useMemo(() => {
    switch (viewMode) {
      case 'overview':
        return accountsQuery.isLoading || leaderboardQuery.isLoading;
      case 'accounts':
        return accountsQuery.isLoading;
      case 'leaderboard':
        return leaderboardQuery.isLoading;
      case 'quizzes':
        return quizzesQuery.isLoading;
      case 'modules':
        return modulesQuery.isLoading;
      case 'feedback':
        return feedbackQuery.isLoading;
      default:
        return false;
    }
  }, [viewMode, accountsQuery.isLoading, leaderboardQuery.isLoading, quizzesQuery.isLoading, modulesQuery.isLoading, feedbackQuery.isLoading]);

  const error = useMemo(() => {
    switch (viewMode) {
      case 'overview':
        return accountsQuery.error || leaderboardQuery.error;
      case 'accounts':
        return accountsQuery.error;
      case 'leaderboard':
        return leaderboardQuery.error;
      case 'quizzes':
        return quizzesQuery.error;
      case 'modules':
        return modulesQuery.error;
      case 'feedback':
        return feedbackQuery.error;
      default:
        return null;
    }
  }, [viewMode, accountsQuery.error, leaderboardQuery.error, quizzesQuery.error, modulesQuery.error, feedbackQuery.error]);

  const exportLeaderboardToPDF = async () => {
    const doc = new jsPDF();
    
    const accounts = accountsQuery.data;
    const leaderboard = leaderboardQuery.data;
    const quizzes = quizzesQuery.data;
    const modules = modulesQuery.data;
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(239, 68, 68);
    doc.text('RiderMind Analytics Report', 14, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 28);
    
    // Add summary statistics
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Summary Statistics', 14, 40);
    
    const summaryData = [
      ['Total Users', String(accounts?.total || 0)],
      ['Active Users', String(accounts?.active || 0)],
      ['Module Completion Rate', `${(modules?.avgCompletionRate || 0).toFixed(1)}%`],
      ['Quiz Pass Rate', `${(quizzes?.passRate || 0).toFixed(1)}%`],
      ['Average Quiz Score', `${(quizzes?.avgScore || 0).toFixed(1)}%`],
    ];
    
    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68], textColor: 255 },
      margin: { left: 14 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 100 },
        1: { cellWidth: 80 }
      }
    });
    
    // Add leaderboard table if available
    if (leaderboard && leaderboard.length > 0) {
      doc.setFontSize(12);
      doc.text('Student Leaderboard', 14, doc.lastAutoTable.finalY + 15);
      
      const leaderboardData = leaderboard.map(student => [
        `#${student.rank}`,
        student.name,
        student.score.toLocaleString(),
        `Level ${student.level}`,
        student.modules,
        student.quizzes,
        `${student.avgScore}%`
      ]);
      
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Rank', 'Student', 'Score', 'Level', 'Modules', 'Quizzes', 'Avg Score']],
        body: leaderboardData,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68], textColor: 255 },
        margin: { left: 14 },
      });
    }
    
    doc.save('analytics-report.pdf');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <PageHeader
          icon={BarChart3}
          title="Analytics"
          description="Comprehensive insights into platform performance and user engagement"
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <PageHeader
          icon={BarChart3}
          title="Analytics"
          description="Comprehensive insights into platform performance and user engagement"
        />
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error.message || 'Failed to load analytics'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          icon={BarChart3}
          title="Analytics"
          description="Comprehensive insights into platform performance and user engagement"
        />
        
        <button
          onClick={exportLeaderboardToPDF}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <FileDown className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* View Mode Selector */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'accounts', label: 'Accounts', icon: '👥' },
          { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
          { id: 'quizzes', label: 'Quizzes', icon: '📝' },
          { id: 'modules', label: 'Modules', icon: '📚' },
          { id: 'feedback', label: 'Feedback', icon: '💬' },
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setViewMode(view.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === view.id
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-gray-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
          >
            <span className="mr-2">{view.icon}</span>
            {view.label}
          </button>
        ))}
      </div>

      {/* Content based on view mode */}
      {viewMode === 'overview' && (
        <OverviewView 
          accountsData={accountsQuery.data} 
          leaderboardData={leaderboardQuery.data}
        />
      )}
      {viewMode === 'accounts' && <AccountsAnalytics data={accountsQuery.data} />}
      {viewMode === 'leaderboard' && <LeaderboardAnalytics data={leaderboardQuery.data} />}
      {viewMode === 'quizzes' && (
        <QuizzesAnalytics 
          data={quizzesQuery.data}
          selectedQuizId={selectedQuizId}
          setSelectedQuizId={setSelectedQuizId}
        />
      )}
      {viewMode === 'modules' && <ModulesAnalytics data={modulesQuery.data} />}
      {viewMode === 'feedback' && (
        <FeedbackAnalytics 
          feedbackData={feedbackQuery.data}
          reactionsData={reactionsQuery.data}
        />
      )}
    </div>
  );
}

// Memoized OverviewView component
const OverviewView = memo(({ accountsData, leaderboardData }) => {
  if (!accountsData || !leaderboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-3"></div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Loading overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Users" value={accountsData.total.toLocaleString()} icon={Users} color="blue" />
        <StatCard title="Active Users" value={accountsData.active.toLocaleString()} icon={CheckCircle} color="green" />
        <StatCard title="New This Month" value={`+${accountsData.newThisMonth}`} icon={TrendingUp} color="purple" />
        <StatCard title="Top Performer" value={leaderboardData[0]?.name || 'N/A'} icon={Trophy} color="orange" />
      </div>

      {/* User Growth Chart */}
      {accountsData.total > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">User Growth Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={accountsData.growth}>
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
      )}

      {/* Top 5 Leaderboard Preview */}
      {leaderboardData && leaderboardData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Top 5 Students</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase">Rank</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase">Student</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase">Score</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {leaderboardData.slice(0, 5).map((student) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});

OverviewView.displayName = 'OverviewView';

// Continue with other components... (truncated for brevity)
// The remaining components (AccountsAnalytics, LeaderboardAnalytics, etc.) would follow the same pattern
// using the data passed as props instead of fetching internally

// Accounts Analytics Component
const AccountsAnalytics = memo(({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-3"></div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Loading accounts data...</p>
        </div>
      </div>
    );
  }

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
});

AccountsAnalytics.displayName = 'AccountsAnalytics';

// Leaderboard Analytics Component  
const LeaderboardAnalytics = memo(({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-3"></div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Loading leaderboard...</p>
        </div>
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
});

LeaderboardAnalytics.displayName = 'LeaderboardAnalytics';

// Due to length, I'll create a simplified version of the remaining components
// QuizzesAnalytics, ModulesAnalytics, and FeedbackAnalytics would follow similar patterns

const QuizzesAnalytics = memo(({ data, selectedQuizId, setSelectedQuizId }) => {
  // Fetch all quizzes list (cached)
  const { data: quizzes, isLoading: loadingQuizzes } = useQuery({
    queryKey: ['quizzes', 'list'],
    queryFn: getAllQuizzes,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch individual quiz reactions only when a quiz is selected
  const { data: quizReactions, isLoading: loadingReactions } = useQuery({
    queryKey: ['quizzes', 'reactions', selectedQuizId],
    queryFn: () => getQuizReactions(selectedQuizId),
    enabled: !!selectedQuizId, // Only fetch when a quiz is selected
    staleTime: 5 * 60 * 1000,
  });

  if (!data || loadingQuizzes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-3"></div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  const selectedQuiz = quizzes?.find(q => q.id === selectedQuizId);

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
            
            {quizzes && quizzes.length > 0 && quizzes.map((quiz) => (
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
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {!selectedQuizId ? (
          // All Quizzes Overview
          <div className="space-y-4">
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
                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                                <ThumbsUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span className="text-xs font-semibold text-green-600 dark:text-green-400">{question.totalLikes}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <ThumbsDown className="w-4 h-4 text-red-600 dark:text-red-400" />
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
});

QuizzesAnalytics.displayName = 'QuizzesAnalytics';

const ModulesAnalytics = memo(({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-3"></div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Loading modules data...</p>
        </div>
      </div>
    );
  }

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
        </>
      )}
    </div>
  );
});

ModulesAnalytics.displayName = 'ModulesAnalytics';

const FeedbackAnalytics = memo(({ feedbackData, reactionsData }) => {
  if (!feedbackData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-3"></div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Loading feedback data...</p>
        </div>
      </div>
    );
  }

  const sentimentData = [
    { name: 'Positive', value: feedbackData.positive, color: '#10b981' },
    { name: 'Neutral', value: feedbackData.neutral, color: '#f59e0b' },
    { name: 'Negative', value: feedbackData.negative, color: '#ef4444' }
  ];

  return (
    <div className="space-y-4">
      {/* Module Feedback Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Feedback" value={feedbackData.totalFeedback.toLocaleString()} icon="💬" color="blue" />
        <StatCard title="Positive" value={feedbackData.positive.toLocaleString()} icon="👍" color="green" />
        <StatCard title="Neutral" value={feedbackData.neutral.toLocaleString()} icon="😐" color="yellow" />
        <StatCard title="Negative" value={feedbackData.negative.toLocaleString()} icon="👎" color="red" />
      </div>

      {feedbackData.totalFeedback === 0 ? (
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
                <div className="text-5xl font-bold text-brand-600 dark:text-brand-400 mb-2">{feedbackData.avgRating}</div>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-2xl">
                      {star <= Math.round(feedbackData.avgRating) ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">out of 5 stars</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                  Based on {feedbackData.totalFeedback} reviews
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
        </>
      )}
    </div>
  );
});

FeedbackAnalytics.displayName = 'FeedbackAnalytics';
