import { useState, useEffect } from 'react';
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Filter, Search, Calendar, User, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function Feedback() {
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState([]);
  const [modules, setModules] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    totalFeedback: 0,
    avgRating: 0,
    positiveCount: 0,
    negativeCount: 0
  });
  
  const [filters, setFilters] = useState({
    search: '',
    module: 'all',
    rating: 'all',
    sentiment: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    fetchFeedbackData();
  }, [filters, currentPage]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query params
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: filters.search,
        module: filters.module,
        rating: filters.rating,
        sentiment: filters.sentiment,
        dateRange: filters.dateRange
      });
      
      const response = await fetch(`/api/module-feedback/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch feedback');
      
      const data = await response.json();
      
      if (data.success) {
        setFeedbackData(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
        setStats(data.stats || {
          totalFeedback: 0,
          avgRating: 0,
          positiveCount: 0,
          negativeCount: 0
        });
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/modules', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch modules');
      
      const data = await response.json();
      if (data.success) {
        setModules(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-neutral-200 dark:border-neutral-700 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        icon={MessageSquare}
        title="Module Feedback"
        description="View and analyze student feedback across all learning modules"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Feedback</span>
            <MessageSquare className="w-5 h-5 text-brand-500" />
          </div>
          <p className="text-3xl font-black text-neutral-900 dark:text-white">{stats.totalFeedback}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">All time</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Average Rating</span>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-black text-neutral-900 dark:text-white">{stats.avgRating}</p>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(stats.avgRating)
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-neutral-300 dark:text-neutral-600'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Positive</span>
            <ThumbsUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-black text-neutral-900 dark:text-white">{stats.positiveCount}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {stats.totalFeedback > 0 ? `${Math.round((stats.positiveCount / stats.totalFeedback) * 100)}%` : '0%'} of total
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Negative</span>
            <ThumbsDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-black text-neutral-900 dark:text-white">{stats.negativeCount}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {stats.totalFeedback > 0 ? `${Math.round((stats.negativeCount / stats.totalFeedback) * 100)}%` : '0%'} of total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Module Filter */}
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <select
              value={filters.module}
              onChange={(e) => handleFilterChange('module', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Modules</option>
              {modules.map(module => (
                <option key={module.id} value={module.id}>{module.title}</option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="relative">
            <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Sentiment Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <select
              value={filters.sentiment}
              onChange={(e) => handleFilterChange('sentiment', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Sentiment</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            All Feedback ({totalCount})
          </h2>
        </div>

        {feedbackData.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              No feedback found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {stats.totalFeedback === 0
                ? 'No feedback has been submitted yet.' 
                : 'Try adjusting your filters to see more results.'}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {feedbackData.map((feedback) => (
              <div key={feedback.id} className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= feedback.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-neutral-300 dark:text-neutral-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-lg font-bold ${getRatingColor(feedback.rating)}`}>
                      {feedback.rating}.0
                    </span>
                  </div>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {formatDate(feedback.createdAt)}
                  </span>
                </div>

                {feedback.comment && (
                  <p className="text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
                    "{feedback.comment}"
                  </p>
                )}

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <User className="w-4 h-4" />
                    <span>
                      {[feedback.user?.first_name, feedback.user?.middle_name, feedback.user?.last_name]
                        .filter(Boolean)
                        .join(' ') || feedback.user?.email || 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <BookOpen className="w-4 h-4" />
                    <span>{feedback.module?.title || 'Unknown Module'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                    return false;
                  })
                  .map((page, index, array) => {
                    if (index > 0 && page - array[index - 1] > 1) {
                      return [
                        <span key={`ellipsis-${page}`} className="px-3 py-2 text-neutral-600 dark:text-neutral-400">...</span>,
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-brand-600 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                          }`}
                        >
                          {page}
                        </button>
                      ];
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-brand-600 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
        )}
      </div>
    </div>
  );
}
