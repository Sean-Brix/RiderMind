import { useState, useMemo } from 'react';

export default function Feedback() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Mock feedback data - replace with API call
  const [feedbackList] = useState([
    {
      id: 1,
      studentName: 'Juan Dela Cruz',
      email: 'juan@example.com',
      module: 'Introduction to Programming',
      sentiment: 'positive',
      rating: 5,
      category: 'Content Quality',
      subject: 'Great learning experience!',
      message: 'The module was very informative and well-structured. The examples helped me understand the concepts better.',
      status: 'reviewed',
      submittedAt: new Date('2025-10-25T10:30:00'),
      reviewedBy: 'Admin User',
      reviewedAt: new Date('2025-10-26T14:20:00')
    },
    {
      id: 2,
      studentName: 'Maria Santos',
      email: 'maria@example.com',
      module: 'JavaScript Basics',
      sentiment: 'neutral',
      rating: 3,
      category: 'Technical Issues',
      subject: 'Video playback issues',
      message: 'Some videos in the module were loading slowly. It would be great if this could be improved.',
      status: 'pending',
      submittedAt: new Date('2025-10-26T15:45:00')
    },
    {
      id: 3,
      studentName: 'Pedro Reyes',
      email: 'pedro@example.com',
      module: 'Advanced React Concepts',
      sentiment: 'negative',
      rating: 2,
      category: 'Content Quality',
      subject: 'Too difficult for beginners',
      message: 'The module assumes prior knowledge that was not covered in previous lessons. Very confusing.',
      status: 'pending',
      submittedAt: new Date('2025-10-27T09:15:00')
    },
    {
      id: 4,
      studentName: 'Ana Garcia',
      email: 'ana@example.com',
      module: 'CSS Fundamentals',
      sentiment: 'positive',
      rating: 5,
      category: 'UI/UX',
      subject: 'Love the interface!',
      message: 'The platform is very user-friendly. Navigation is intuitive and the design is clean.',
      status: 'reviewed',
      submittedAt: new Date('2025-10-24T13:20:00'),
      reviewedBy: 'Admin User',
      reviewedAt: new Date('2025-10-25T10:30:00')
    },
    {
      id: 5,
      studentName: 'Carlos Mendoza',
      email: 'carlos@example.com',
      module: 'Database Design',
      sentiment: 'positive',
      rating: 4,
      category: 'Content Quality',
      subject: 'Very helpful exercises',
      message: 'The practical exercises really helped reinforce the concepts. Would love more of these!',
      status: 'pending',
      submittedAt: new Date('2025-10-27T08:00:00')
    }
  ]);

  // Filtered and sorted feedback
  const filteredFeedback = useMemo(() => {
    let result = feedbackList;

    // Filter by tab
    if (activeTab !== 'all') {
      result = result.filter(f => f.sentiment === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f => 
        f.studentName.toLowerCase().includes(query) ||
        f.email.toLowerCase().includes(query) ||
        f.module.toLowerCase().includes(query) ||
        f.subject.toLowerCase().includes(query) ||
        f.message.toLowerCase().includes(query)
      );
    }

    // Filter by sentiment
    if (filterSentiment !== 'all') {
      result = result.filter(f => f.sentiment === filterSentiment);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(f => f.status === filterStatus);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.submittedAt - a.submittedAt;
        case 'oldest':
          return a.submittedAt - b.submittedAt;
        case 'rating-high':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return result;
  }, [feedbackList, activeTab, searchQuery, filterSentiment, filterStatus, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = feedbackList.length;
    const positive = feedbackList.filter(f => f.sentiment === 'positive').length;
    const neutral = feedbackList.filter(f => f.sentiment === 'neutral').length;
    const negative = feedbackList.filter(f => f.sentiment === 'negative').length;
    const pending = feedbackList.filter(f => f.status === 'pending').length;
    const reviewed = feedbackList.filter(f => f.status === 'reviewed').length;
    const avgRating = feedbackList.reduce((sum, f) => sum + f.rating, 0) / total || 0;

    return { total, positive, neutral, negative, pending, reviewed, avgRating };
  }, [feedbackList]);

  const handleMarkAsReviewed = (id) => {
    // TODO: Implement mark as reviewed
    console.log('Mark as reviewed:', id);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Feedback Management</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">View and manage student feedback and reviews</p>
        </div>
        
        {/* Compact Stats */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.total}</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Total</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.avgRating.toFixed(1)}</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Avg Rating</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Pending</div>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1">
              <span className="text-green-600 dark:text-green-400 font-medium">{stats.positive}</span> 👍
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">{stats.neutral}</span> 😐
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="text-red-600 dark:text-red-400 font-medium">{stats.negative}</span> 👎
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Search Feedback
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, module, or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-neutral-400" />
            </div>
          </div>

          {/* Sentiment Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Sentiment
            </label>
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || filterSentiment !== 'all' || filterStatus !== 'all' || sortBy !== 'newest') && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Showing {filteredFeedback.length} of {stats.total} feedback entries
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterSentiment('all');
                setFilterStatus('all');
                setSortBy('newest');
              }}
              className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Feedback List */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Feedback Entries
            </h2>
            <button className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
              Export to CSV
            </button>
          </div>
        </div>

        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {filteredFeedback.length > 0 ? (
            filteredFeedback.map((feedback) => (
              <FeedbackItem
                key={feedback.id}
                feedback={feedback}
                onMarkAsReviewed={handleMarkAsReviewed}
              />
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageIcon className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                No feedback found
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {searchQuery || filterSentiment !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No feedback submissions yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function FeedbackItem({ feedback, onMarkAsReviewed }) {
  const [expanded, setExpanded] = useState(false);

  const sentimentColors = {
    positive: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    neutral: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    negative: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
  };

  const statusColors = {
    pending: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
    reviewed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
  };

  return (
    <div className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              {feedback.subject}
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${sentimentColors[feedback.sentiment]}`}>
              {feedback.sentiment}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[feedback.status]}`}>
              {feedback.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <UserIcon className="w-4 h-4" />
              {feedback.studentName}
            </span>
            <span className="flex items-center gap-1">
              <EmailIcon className="w-4 h-4" />
              {feedback.email}
            </span>
            <span className="flex items-center gap-1">
              <ModuleIcon className="w-4 h-4" />
              {feedback.module}
            </span>
            <span className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-neutral-300 dark:text-neutral-600'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors"
          >
            <svg
              className={`w-5 h-5 text-neutral-600 dark:text-neutral-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Message</h4>
            <p className="text-sm text-neutral-900 dark:text-neutral-100">
              {feedback.message}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neutral-600 dark:text-neutral-400">Category:</span>
              <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">{feedback.category}</span>
            </div>
            <div>
              <span className="text-neutral-600 dark:text-neutral-400">Submitted:</span>
              <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                {feedback.submittedAt.toLocaleString()}
              </span>
            </div>
            {feedback.reviewedBy && (
              <>
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Reviewed By:</span>
                  <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">{feedback.reviewedBy}</span>
                </div>
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Reviewed At:</span>
                  <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                    {feedback.reviewedAt.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>

          {feedback.status === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => onMarkAsReviewed(feedback.id)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Mark as Reviewed
              </button>
              <button className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg text-sm font-medium transition-colors">
                Send Response
              </button>
            </div>
          )}
        </div>
      )}

      {!expanded && (
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
          {feedback.message}
        </p>
      )}

      <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
        {feedback.submittedAt.toLocaleDateString()} at {feedback.submittedAt.toLocaleTimeString()}
      </div>
    </div>
  );
}

// Icons
function MessageIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function EmailIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ModuleIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
