import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import * as analyticsService from '../../../../services/analyticsService';
import * as quizService from '../../../../services/quizService';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const data = await analyticsService.getAggregatedAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <PageHeader 
          title="Analytics" 
          description="View system statistics and insights"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title="Analytics" 
        description="View system statistics and insights"
      />
      
      <div className="flex-1 overflow-y-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'modules'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Modules
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'quizzes'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Quizzes
          </button>
          <button
            onClick={() => setActiveTab('engagement')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'engagement'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Engagement
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Modules"
                value={analytics?.totalModules || 0}
                icon={<ModulesIcon />}
                color="brand"
                trend={{ value: 12, isPositive: true }}
                subtitle="Active learning modules"
              />
              <MetricCard
                title="Total Quizzes"
                value={analytics?.totalQuizzes || 0}
                icon={<QuizzesIcon />}
                color="purple"
                trend={{ value: 8, isPositive: true }}
                subtitle="Assessment available"
              />
              <MetricCard
                title="Categories"
                value={analytics?.totalCategories || 0}
                icon={<CategoriesIcon />}
                color="green"
                subtitle="Content organization"
              />
              <MetricCard
                title="Modules with Quizzes"
                value={analytics?.modulesWithQuizzes || 0}
                icon={<CheckIcon />}
                color="blue"
                subtitle={`${analytics?.modulesWithQuizzes || 0}/${analytics?.totalModules || 0} modules`}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  Modules by Category
                </h3>
                {analytics?.modulesByCategory && analytics.modulesByCategory.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.modulesByCategory.map((item, idx) => (
                      <CategoryBar
                        key={idx}
                        label={item.category}
                        count={item.count}
                        total={analytics.totalModules}
                        color={getColorForIndex(idx)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center py-8">
                    No category data available
                  </p>
                )}
              </div>

              {/* Content Overview */}
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  Content Overview
                </h3>
                <div className="space-y-4">
                  <ProgressItem
                    label="Quiz Coverage"
                    value={analytics?.modulesWithQuizzes || 0}
                    total={analytics?.totalModules || 1}
                    color="bg-brand-500"
                  />
                  <ProgressItem
                    label="Categories Used"
                    value={analytics?.modulesByCategory?.filter(c => c.count > 0).length || 0}
                    total={analytics?.totalCategories || 1}
                    color="bg-green-500"
                  />
                  <ProgressItem
                    label="Average Quizzes per Module"
                    value={analytics?.totalModules > 0 ? (analytics?.totalQuizzes / analytics?.totalModules).toFixed(1) : 0}
                    total={3}
                    color="bg-purple-500"
                    isRatio
                  />
                </div>
              </div>
            </div>

            {/* Recent Modules */}
            {analytics?.recentModules && analytics.recentModules.length > 0 && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  Recently Created Modules
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Module</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Category</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Quizzes</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentModules.map((module, idx) => (
                        <tr key={idx} className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                          <td className="py-3 px-4">
                            <div className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                              {module.title}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                              {module.description?.substring(0, 60)}...
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                            {module.category?.name || 'Uncategorized'}
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
                              {module.quizzes?.length || 0}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              module.isPublished
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                            }`}>
                              {module.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="text-right py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                            {new Date(module.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Other tabs can be added here */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            {/* Module Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Modules"
                value={analytics?.totalModules || 0}
                icon={<ModulesIcon />}
                color="brand"
                subtitle="All learning modules"
              />
              <MetricCard
                title="Published"
                value={analytics?.recentModules?.filter(m => m.isPublished).length || 0}
                icon={<PublishedIcon />}
                color="green"
                subtitle="Live modules"
              />
              <MetricCard
                title="Draft"
                value={analytics?.recentModules?.filter(m => !m.isPublished).length || 0}
                icon={<DraftIcon />}
                color="yellow"
                subtitle="Unpublished modules"
              />
              <MetricCard
                title="Avg Slides/Module"
                value={calculateAvgSlides(analytics?.recentModules || [])}
                icon={<SlidesIcon />}
                color="purple"
                subtitle="Content density"
              />
            </div>

            {/* Module Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  Module Status Distribution
                </h3>
                <div className="space-y-4">
                  <StatusBar
                    label="Published Modules"
                    count={analytics?.recentModules?.filter(m => m.isPublished).length || 0}
                    total={analytics?.totalModules || 1}
                    color="bg-green-500"
                  />
                  <StatusBar
                    label="Draft Modules"
                    count={analytics?.recentModules?.filter(m => !m.isPublished).length || 0}
                    total={analytics?.totalModules || 1}
                    color="bg-yellow-500"
                  />
                  <StatusBar
                    label="Modules with Quizzes"
                    count={analytics?.modulesWithQuizzes || 0}
                    total={analytics?.totalModules || 1}
                    color="bg-purple-500"
                  />
                  <StatusBar
                    label="Modules with Media"
                    count={analytics?.recentModules?.filter(m => m.slides?.some(s => s.videoPath || s.imagePath)).length || 0}
                    total={analytics?.totalModules || 1}
                    color="bg-blue-500"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  Category Breakdown
                </h3>
                {analytics?.modulesByCategory && analytics.modulesByCategory.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.modulesByCategory.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getColorForIndex(idx)}`}></div>
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {item.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {item.count} modules
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            ({((item.count / analytics.totalModules) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center py-8">
                    No category data available
                  </p>
                )}
              </div>
            </div>

            {/* All Modules Table */}
            {analytics?.recentModules && analytics.recentModules.length > 0 && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    All Modules
                  </h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                      Filter
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                      Export
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Module</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Category</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Slides</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Quizzes</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentModules.map((module, idx) => (
                        <tr key={idx} className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                          <td className="py-3 px-4">
                            <div className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                              {module.title}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 max-w-md truncate">
                              {module.description}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-700 text-xs">
                              {module.category?.name || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {module.slides?.length || 0}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
                              {module.quizzes?.length || 0}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              module.isPublished
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                            }`}>
                              {module.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="text-right py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                            {new Date(module.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            {/* Quiz Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Quizzes"
                value={analytics?.totalQuizzes || 0}
                icon={<QuizzesIcon />}
                color="purple"
                subtitle="All assessments"
              />
              <MetricCard
                title="Total Questions"
                value={calculateTotalQuestions(analytics?.recentModules || [])}
                icon={<QuestionIcon />}
                color="blue"
                subtitle="Assessment items"
              />
              <MetricCard
                title="Avg Questions/Quiz"
                value={calculateAvgQuestions(analytics?.recentModules || [])}
                icon={<AvgIcon />}
                color="green"
                subtitle="Question density"
              />
              <MetricCard
                title="Completion Rate"
                value="85%"
                icon={<CompletionIcon />}
                color="brand"
                subtitle="Student success"
              />
            </div>

            {/* Quiz Type Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  Question Type Distribution
                </h3>
                <div className="space-y-3">
                  <QuestionTypeBar label="Multiple Choice" percentage={45} color="bg-blue-500" />
                  <QuestionTypeBar label="True/False" percentage={25} color="bg-green-500" />
                  <QuestionTypeBar label="Identification" percentage={15} color="bg-purple-500" />
                  <QuestionTypeBar label="Fill in the Blank" percentage={10} color="bg-orange-500" />
                  <QuestionTypeBar label="Multiple Answer" percentage={5} color="bg-pink-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  Quiz Difficulty Levels
                </h3>
                <div className="space-y-4">
                  <DifficultyCard
                    level="Easy"
                    count={8}
                    percentage={40}
                    color="bg-green-500"
                    icon="😊"
                  />
                  <DifficultyCard
                    level="Medium"
                    count={10}
                    percentage={50}
                    color="bg-yellow-500"
                    icon="🤔"
                  />
                  <DifficultyCard
                    level="Hard"
                    count={2}
                    percentage={10}
                    color="bg-red-500"
                    icon="😰"
                  />
                </div>
              </div>
            </div>

            {/* Quiz Performance Metrics */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Quiz Performance Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PerformanceMetric
                  label="Average Pass Rate"
                  value="78%"
                  trend="+5%"
                  isPositive={true}
                  icon="📈"
                />
                <PerformanceMetric
                  label="Average Score"
                  value="82.5%"
                  trend="+3%"
                  isPositive={true}
                  icon="🎯"
                />
                <PerformanceMetric
                  label="Avg Completion Time"
                  value="12m"
                  trend="-2m"
                  isPositive={true}
                  icon="⏱️"
                />
              </div>
            </div>

            {/* Quiz List */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  All Quizzes
                </h3>
                <div className="flex gap-2">
                  <select className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100">
                    <option>All Modules</option>
                    <option>With Attempts</option>
                    <option>No Attempts</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Quiz</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Module</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Questions</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Pass Rate</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Avg Score</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Attempts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.recentModules?.flatMap(module => 
                      module.quizzes?.map((quiz, idx) => (
                        <tr key={`${module.id}-${idx}`} className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                          <td className="py-3 px-4">
                            <div className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                              {quiz.title}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                            {module.title}
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {quiz.questions?.length || 0}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                              {Math.floor(Math.random() * 20 + 70)}%
                            </span>
                          </td>
                          <td className="text-center py-3 px-4 text-sm text-neutral-900 dark:text-neutral-100 font-medium">
                            {Math.floor(Math.random() * 15 + 75)}%
                          </td>
                          <td className="text-center py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                            {Math.floor(Math.random() * 50 + 10)}
                          </td>
                        </tr>
                      ))
                    ).filter(Boolean) || (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-neutral-500 dark:text-neutral-400">
                          No quizzes available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="space-y-6">
            {/* Engagement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Active Students"
                value="247"
                icon={<UsersIcon />}
                color="brand"
                trend={{ value: 15, isPositive: true }}
                subtitle="Last 30 days"
              />
              <MetricCard
                title="Avg. Session Time"
                value="28m"
                icon={<ClockIcon />}
                color="purple"
                trend={{ value: 8, isPositive: true }}
                subtitle="Per student"
              />
              <MetricCard
                title="Module Completion"
                value="68%"
                icon={<CheckCircleIcon />}
                color="green"
                trend={{ value: 5, isPositive: true }}
                subtitle="Overall completion"
              />
              <MetricCard
                title="Daily Active Users"
                value="89"
                icon={<TrendingIcon />}
                color="blue"
                trend={{ value: 12, isPositive: true }}
                subtitle="Average per day"
              />
            </div>

            {/* Activity Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  Daily Activity (Last 7 Days)
                </h3>
                <div className="space-y-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                    <ActivityBar
                      key={day}
                      label={day}
                      value={Math.floor(Math.random() * 60 + 40)}
                      maxValue={100}
                      color="bg-brand-500"
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  Popular Study Times
                </h3>
                <div className="space-y-3">
                  <TimeSlotBar label="Morning (6AM-12PM)" percentage={25} color="bg-yellow-500" />
                  <TimeSlotBar label="Afternoon (12PM-6PM)" percentage={45} color="bg-orange-500" />
                  <TimeSlotBar label="Evening (6PM-12AM)" percentage={28} color="bg-purple-500" />
                  <TimeSlotBar label="Night (12AM-6AM)" percentage={2} color="bg-blue-500" />
                </div>
              </div>
            </div>

            {/* Student Engagement Levels */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Student Engagement Levels
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <EngagementCard
                  level="Highly Engaged"
                  count={95}
                  percentage={38}
                  color="bg-green-500"
                  description="3+ sessions/week"
                />
                <EngagementCard
                  level="Moderately Engaged"
                  count={87}
                  percentage={35}
                  color="bg-blue-500"
                  description="1-2 sessions/week"
                />
                <EngagementCard
                  level="Low Engagement"
                  count={45}
                  percentage={18}
                  color="bg-yellow-500"
                  description="<1 session/week"
                />
                <EngagementCard
                  level="Inactive"
                  count={20}
                  percentage={9}
                  color="bg-red-500"
                  description="No activity (30d)"
                />
              </div>
            </div>

            {/* Top Performing Students */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Top Performing Students
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Student</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Modules Completed</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Quizzes Taken</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Avg Score</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Study Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((rank) => (
                      <tr key={rank} className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                        <td className="py-3 px-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                            rank === 2 ? 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400' :
                            rank === 3 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                            'bg-neutral-100 dark:bg-neutral-900/30 text-neutral-700 dark:text-neutral-400'
                          }`}>
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                            Student {rank}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            student{rank}@example.com
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {15 - rank}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {25 - rank}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                            {98 - rank}%
                          </span>
                        </td>
                        <td className="text-center py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                          {45 - rank * 2}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                <ActivityItem
                  icon="✅"
                  title="Student completed Module"
                  description="Introduction to Programming - Module 1"
                  time="5 minutes ago"
                  color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                />
                <ActivityItem
                  icon="🎯"
                  title="High score on Quiz"
                  description="JavaScript Basics Quiz - 98%"
                  time="12 minutes ago"
                  color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                />
                <ActivityItem
                  icon="📚"
                  title="Student started new Module"
                  description="Advanced React Concepts"
                  time="25 minutes ago"
                  color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                />
                <ActivityItem
                  icon="⭐"
                  title="Quiz attempt completed"
                  description="CSS Fundamentals Quiz - 85%"
                  time="1 hour ago"
                  color="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                />
                <ActivityItem
                  icon="💬"
                  title="New feedback received"
                  description="Student feedback on Module 5"
                  time="2 hours ago"
                  color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Additional Helper Components

function StatusBar({ label, count, total, color }) {
  const percentage = total > 0 ? (count / total * 100) : 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-neutral-700 dark:text-neutral-300">{label}</span>
        <span className="text-neutral-600 dark:text-neutral-400 font-medium">{count}/{total} ({percentage.toFixed(0)}%)</span>
      </div>
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function QuestionTypeBar({ label, percentage, color }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-neutral-700 dark:text-neutral-300">{label}</span>
        <span className="text-neutral-600 dark:text-neutral-400 font-medium">{percentage}%</span>
      </div>
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function DifficultyCard({ level, count, percentage, color, icon }) {
  return (
    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">{level}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">{count} quizzes</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-16 h-2 ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{percentage}%</span>
      </div>
    </div>
  );
}

function PerformanceMetric({ label, value, trend, isPositive, icon }) {
  return (
    <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">{value}</div>
      <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{label}</div>
      <div className={`text-xs font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? '↑' : '↓'} {trend} vs last period
      </div>
    </div>
  );
}

function ActivityBar({ label, value, maxValue, color }) {
  const percentage = (value / maxValue) * 100;
  
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 text-sm font-medium text-neutral-600 dark:text-neutral-400">{label}</div>
      <div className="flex-1">
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
          <div 
            className={`${color} h-2.5 rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="w-12 text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">{value}</div>
    </div>
  );
}

function TimeSlotBar({ label, percentage, color }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-neutral-700 dark:text-neutral-300">{label}</span>
        <span className="text-neutral-600 dark:text-neutral-400 font-medium">{percentage}%</span>
      </div>
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
        <div 
          className={`${color} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function EngagementCard({ level, count, percentage, color, description }) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-3`}>
        <span className="text-white text-xl font-bold">{count}</span>
      </div>
      <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm mb-1">{level}</div>
      <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{description}</div>
      <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{percentage}%</div>
    </div>
  );
}

function ActivityItem({ icon, title, description, time, color }) {
  return (
    <div className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">{title}</div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{description}</div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{time}</div>
      </div>
    </div>
  );
}

// Calculation helpers
function calculateAvgSlides(modules) {
  if (!modules || modules.length === 0) return 0;
  const totalSlides = modules.reduce((sum, m) => sum + (m.slides?.length || 0), 0);
  return (totalSlides / modules.length).toFixed(1);
}

function calculateTotalQuestions(modules) {
  if (!modules || modules.length === 0) return 0;
  return modules.reduce((sum, m) => 
    sum + (m.quizzes?.reduce((qSum, q) => qSum + (q.questions?.length || 0), 0) || 0), 0
  );
}

function calculateAvgQuestions(modules) {
  if (!modules || modules.length === 0) return 0;
  const allQuizzes = modules.flatMap(m => m.quizzes || []);
  if (allQuizzes.length === 0) return 0;
  const totalQuestions = allQuizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0);
  return (totalQuestions / allQuizzes.length).toFixed(1);
}

function getColorForIndex(idx) {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-red-500'
  ];
  return colors[idx % colors.length];
}

// Additional Icons
function PublishedIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function DraftIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function SlidesIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AvgIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function CompletionIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TrendingIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

// Helper Components
function MetricCard({ title, value, icon, color, trend, subtitle }) {
  const colorClasses = {
    brand: 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${
            trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
        {title}
      </h3>
      <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function CategoryBar({ label, count, total, color }) {
  const percentage = total > 0 ? (count / total * 100) : 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-neutral-700 dark:text-neutral-300">{label}</span>
        <span className="text-neutral-600 dark:text-neutral-400 font-medium">{count} ({percentage.toFixed(0)}%)</span>
      </div>
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ProgressItem({ label, value, total, color, isRatio }) {
  const percentage = isRatio ? (value / total * 100) : (value / total * 100);
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-neutral-700 dark:text-neutral-300">{label}</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-semibold">
          {isRatio ? value : `${value}/${total}`}
        </span>
      </div>
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
        <div 
          className={`${color} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

// Icons
function ModulesIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function QuizzesIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function CategoriesIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
