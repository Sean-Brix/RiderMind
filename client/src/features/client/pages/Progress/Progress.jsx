import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../../components/Navbar';
import { getMyModules } from '../../../../services/studentModuleService';

export default function Progress() {
  const [modules, setModules] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, completed, in-progress, not-started
  
  // Check if user is authenticated
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (user) {
      loadModules();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadModules = async () => {
    try {
      setLoading(true);
      const response = await getMyModules(null, true); // checkOnly=true to prevent auto-enrollment
      if (response.success) {
        setModules(response.data.modules);
        setCategoryInfo(response.data.category);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = modules.length;
    const completed = modules.filter(m => m.isCompleted).length;
    const inProgress = modules.filter(m => m.progress > 0 && !m.isCompleted).length;
    const notStarted = modules.filter(m => m.progress === 0).length;
    const totalXP = modules.reduce((sum, m) => sum + (m.isCompleted ? 100 : Math.floor(m.progress)), 0);
    const avgProgress = total > 0 ? modules.reduce((sum, m) => sum + m.progress, 0) / total : 0;
    const totalQuizAttempts = modules.reduce((sum, m) => sum + (m.quizAttempts || 0), 0);
    const passedQuizzes = modules.filter(m => m.quizPassed).length;
    const avgQuizScore = modules.filter(m => m.quizScore).reduce((sum, m, idx, arr) => {
      return sum + (m.quizScore / arr.length);
    }, 0);

    // Level calculation
    const level = Math.floor(totalXP / 200) + 1;
    const xpForCurrentLevel = (level - 1) * 200;
    const xpForNextLevel = level * 200;
    const xpProgress = ((totalXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      totalXP,
      avgProgress,
      level,
      xpProgress,
      xpForNextLevel,
      totalQuizAttempts,
      passedQuizzes,
      avgQuizScore: avgQuizScore || 0
    };
  }, [modules]);

  // Filter modules
  const filteredModules = useMemo(() => {
    switch (selectedFilter) {
      case 'completed':
        return modules.filter(m => m.isCompleted);
      case 'in-progress':
        return modules.filter(m => m.progress > 0 && !m.isCompleted);
      case 'not-started':
        return modules.filter(m => m.progress === 0);
      default:
        return modules;
    }
  }, [modules, selectedFilter]);

  // If not authenticated, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-700">
              <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                Login Required
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Please log in to view your learning progress and statistics.
              </p>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full px-6 py-3 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-6 py-3 text-sm font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 dark:hover:bg-brand-900/50 rounded-lg transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading your progress...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center text-red-600 dark:text-red-400">
            <p className="text-xl font-bold mb-2">Error Loading Progress</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
            🏆 Your Learning Journey
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {categoryInfo?.name || 'Track your progress and achievements'}
          </p>
        </div>

        {/* Level & XP Progress */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-1">Level {stats.level}</h2>
              <p className="text-brand-100">Keep learning to level up!</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{stats.totalXP} XP</div>
              <div className="text-sm text-brand-100">{stats.xpForNextLevel - stats.totalXP} XP to next level</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {stats.level + 1}</span>
              <span>{Math.round(stats.xpProgress)}%</span>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${stats.xpProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon="📊"
            label="Overall Progress"
            value={`${Math.round(stats.avgProgress)}%`}
            color="bg-blue-500"
            progress={stats.avgProgress}
          />
          <StatCard
            icon="✅"
            label="Completion Rate"
            value={`${Math.round(stats.completionRate)}%`}
            subtitle={`${stats.completed}/${stats.total} modules`}
            color="bg-green-500"
            progress={stats.completionRate}
          />
          <StatCard
            icon="🎯"
            label="Quiz Success"
            value={`${Math.round((stats.passedQuizzes / stats.total) * 100)}%`}
            subtitle={`${stats.passedQuizzes} passed`}
            color="bg-purple-500"
            progress={(stats.passedQuizzes / stats.total) * 100}
          />
          <StatCard
            icon="📝"
            label="Avg Quiz Score"
            value={`${Math.round(stats.avgQuizScore)}%`}
            subtitle={`${stats.totalQuizAttempts} attempts`}
            color="bg-orange-500"
            progress={stats.avgQuizScore}
          />
        </div>

        {/* Module Status Breakdown */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Module Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatusCard
              icon="✅"
              label="Completed"
              count={stats.completed}
              color="bg-green-500"
              percentage={(stats.completed / stats.total) * 100}
            />
            <StatusCard
              icon="🔄"
              label="In Progress"
              count={stats.inProgress}
              color="bg-blue-500"
              percentage={(stats.inProgress / stats.total) * 100}
            />
            <StatusCard
              icon="⏸️"
              label="Not Started"
              count={stats.notStarted}
              color="bg-neutral-400"
              percentage={(stats.notStarted / stats.total) * 100}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b border-neutral-200 dark:border-neutral-700">
            <FilterTab
              label="All Modules"
              count={modules.length}
              active={selectedFilter === 'all'}
              onClick={() => setSelectedFilter('all')}
            />
            <FilterTab
              label="Completed"
              count={stats.completed}
              active={selectedFilter === 'completed'}
              onClick={() => setSelectedFilter('completed')}
            />
            <FilterTab
              label="In Progress"
              count={stats.inProgress}
              active={selectedFilter === 'in-progress'}
              onClick={() => setSelectedFilter('in-progress')}
            />
            <FilterTab
              label="Not Started"
              count={stats.notStarted}
              active={selectedFilter === 'not-started'}
              onClick={() => setSelectedFilter('not-started')}
            />
          </div>

          {/* Module List */}
          <div className="p-6">
            {filteredModules.length > 0 ? (
              <div className="space-y-4">
                {filteredModules.map((studentModule, index) => (
                  <ModuleProgressCard
                    key={studentModule.id}
                    studentModule={studentModule}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-neutral-600 dark:text-neutral-400 font-medium">
                  No modules in this category
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Achievements Section */}
        {stats.completed > 0 && (
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">🎉 Achievements Unlocked!</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.completed >= 1 && (
                <Achievement
                  icon="🎓"
                  title="First Steps"
                  description="Complete your first module"
                />
              )}
              {stats.completed >= 5 && (
                <Achievement
                  icon="⭐"
                  title="Rising Star"
                  description="Complete 5 modules"
                />
              )}
              {stats.completed >= 10 && (
                <Achievement
                  icon="🏆"
                  title="Champion"
                  description="Complete 10 modules"
                />
              )}
              {stats.avgQuizScore >= 90 && (
                <Achievement
                  icon="💯"
                  title="Quiz Master"
                  description="Maintain 90%+ quiz average"
                />
              )}
              {stats.passedQuizzes === stats.total && stats.total > 0 && (
                <Achievement
                  icon="🎯"
                  title="Perfect Record"
                  description="Pass all quizzes"
                />
              )}
              {stats.level >= 5 && (
                <Achievement
                  icon="🚀"
                  title="Expert Learner"
                  description="Reach Level 5"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ icon, label, value, subtitle, color, progress }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl">{icon}</span>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white font-bold`}>
          {value.split('%')[0]}
        </div>
      </div>
      <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">{label}</h3>
      <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">{value}</div>
      {subtitle && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</p>
      )}
      {progress !== undefined && (
        <div className="mt-3 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function StatusCard({ icon, label, count, color, percentage }) {
  return (
    <div className="text-center">
      <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center text-3xl mx-auto mb-3`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">{count}</div>
      <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{label}</div>
      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {Math.round(percentage)}% of total
      </div>
    </div>
  );
}

function FilterTab({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
        active
          ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border-b-2 border-brand-600'
          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
      }`}
    >
      {label} <span className="ml-2 text-xs opacity-75">({count})</span>
    </button>
  );
}

function ModuleProgressCard({ studentModule, index }) {
  const module = studentModule.module;
  const isCompleted = studentModule.isCompleted;
  const progress = studentModule.progress;

  const getStatusColor = () => {
    if (isCompleted) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (progress > 0) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400';
  };

  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (progress > 0) return 'In Progress';
    return 'Not Started';
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Module Number */}
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
          isCompleted
            ? 'bg-green-500 text-white'
            : progress > 0
            ? 'bg-brand-500 text-white'
            : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
        }`}>
          {index + 1}
        </div>

        {/* Module Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
                {module.title}
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {module.objectives?.length || 0} objectives • {module.slides?.length || 0} slides
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Progress</span>
              <span className="font-medium text-neutral-900 dark:text-white">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted
                    ? 'bg-green-500'
                    : 'bg-gradient-to-r from-brand-500 to-brand-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Quiz Info */}
          {studentModule.quizAttempts > 0 && (
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Attempts: {studentModule.quizAttempts}</span>
              </div>
              {studentModule.quizScore && (
                <div className={`flex items-center gap-1 font-medium ${
                  studentModule.quizPassed
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Score: {Math.round(studentModule.quizScore)}%</span>
                </div>
              )}
            </div>
          )}

          {/* Completion Date */}
          {studentModule.completedAt && (
            <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Completed on {new Date(studentModule.completedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Achievement({ icon, title, description }) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
      <div className="text-4xl mb-2">{icon}</div>
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-sm opacity-90">{description}</p>
    </div>
  );
}
