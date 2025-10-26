import { useMemo } from 'react';

export default function QuizAnalytics({ statistics }) {
  if (!statistics) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-600 dark:text-neutral-400">
          Select a quiz to view analytics
        </p>
      </div>
    );
  }

  // Calculate additional metrics
  const metrics = useMemo(() => {
    const scoreRanges = {
      excellent: 0, // 90-100%
      good: 0,      // 75-89%
      average: 0,   // 60-74%
      poor: 0       // <60%
    };

    statistics.attempts?.forEach(attempt => {
      const score = attempt.percentage || 0;
      if (score >= 90) scoreRanges.excellent++;
      else if (score >= 75) scoreRanges.good++;
      else if (score >= 60) scoreRanges.average++;
      else scoreRanges.poor++;
    });

    return {
      scoreRanges,
      highestScore: Math.max(...(statistics.attempts?.map(a => a.percentage) || [0])),
      lowestScore: Math.min(...(statistics.attempts?.map(a => a.percentage) || [0])),
      medianScore: calculateMedian(statistics.attempts?.map(a => a.percentage) || []),
      completionRate: statistics.totalAttempts > 0 
        ? ((statistics.completedAttempts || statistics.totalAttempts) / statistics.totalAttempts * 100).toFixed(1)
        : 0,
    };
  }, [statistics]);

  function calculateMedian(numbers) {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Attempts */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Total Attempts
            </h3>
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {statistics.totalAttempts || 0}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            {statistics.uniqueStudents || 0} unique students
          </p>
        </div>

        {/* Pass Rate */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Pass Rate
            </h3>
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {statistics.passRate ? `${statistics.passRate.toFixed(1)}%` : '0%'}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            {statistics.passedAttempts || 0} passed / {statistics.failedAttempts || 0} failed
          </p>
        </div>

        {/* Average Score */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Average Score
            </h3>
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {statistics.averageScore ? `${statistics.averageScore.toFixed(1)}%` : '0%'}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            Median: {metrics.medianScore.toFixed(1)}%
          </p>
        </div>

        {/* Average Time */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Avg. Completion Time
            </h3>
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {statistics.averageTime ? `${Math.floor(statistics.averageTime / 60)}m` : '0m'}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            {statistics.averageTime ? `${statistics.averageTime % 60}s` : '0s'}
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Score Distribution
          </h3>
          <div className="space-y-3">
            <ScoreBar label="Excellent (90-100%)" count={metrics.scoreRanges.excellent} total={statistics.totalAttempts} color="bg-green-500" />
            <ScoreBar label="Good (75-89%)" count={metrics.scoreRanges.good} total={statistics.totalAttempts} color="bg-blue-500" />
            <ScoreBar label="Average (60-74%)" count={metrics.scoreRanges.average} total={statistics.totalAttempts} color="bg-yellow-500" />
            <ScoreBar label="Poor (<60%)" count={metrics.scoreRanges.poor} total={statistics.totalAttempts} color="bg-red-500" />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <MetricItem 
              label="Highest Score" 
              value={`${metrics.highestScore.toFixed(1)}%`}
              icon="🏆"
            />
            <MetricItem 
              label="Lowest Score" 
              value={`${metrics.lowestScore.toFixed(1)}%`}
              icon="📉"
            />
            <MetricItem 
              label="Completion Rate" 
              value={`${metrics.completionRate}%`}
              icon="✅"
            />
            <MetricItem 
              label="Questions" 
              value={statistics.totalQuestions || 0}
              icon="❓"
            />
          </div>
        </div>
      </div>

      {/* Question Performance */}
      {statistics.questionStats && statistics.questionStats.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Question-by-Question Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Question</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Success Rate</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Avg Time</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {statistics.questionStats.map((q, idx) => (
                  <tr key={idx} className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                    <td className="py-3 px-4 text-sm text-neutral-900 dark:text-neutral-100">
                      <div className="max-w-md truncate">{q.question || `Question ${idx + 1}`}</div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        q.successRate >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                        q.successRate >= 60 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                        q.successRate >= 40 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}>
                        {q.successRate ? `${q.successRate.toFixed(1)}%` : 'N/A'}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                      {q.averageTime ? `${q.averageTime}s` : 'N/A'}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        q.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                        q.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}>
                        {q.difficulty || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Attempts */}
      {statistics.recentAttempts && statistics.recentAttempts.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Recent Attempts
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Student</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Score</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Time</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {statistics.recentAttempts.slice(0, 10).map((attempt, idx) => (
                  <tr key={idx} className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                    <td className="py-3 px-4 text-sm text-neutral-900 dark:text-neutral-100">
                      {attempt.studentName || 'Unknown Student'}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {attempt.percentage ? `${attempt.percentage.toFixed(1)}%` : 'N/A'}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        attempt.passed 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}>
                        {attempt.passed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                      {attempt.completionTime ? `${Math.floor(attempt.completionTime / 60)}m ${attempt.completionTime % 60}s` : 'N/A'}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                      {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : 'N/A'}
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
}

// Helper component for score distribution bars
function ScoreBar({ label, count, total, color }) {
  const percentage = total > 0 ? (count / total * 100) : 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-neutral-700 dark:text-neutral-300">{label}</span>
        <span className="text-neutral-600 dark:text-neutral-400 font-medium">{count} ({percentage.toFixed(1)}%)</span>
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

// Helper component for metric items
function MetricItem({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{label}</span>
      </div>
      <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{value}</span>
    </div>
  );
}
