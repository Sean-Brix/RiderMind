/**
 * FeedbackList Component
 * 
 * Displays paginated list of all feedbacks for a module.
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, MessageSquare } from 'lucide-react';
import { useFeedback } from '../../contexts/FeedbackContext';
import FeedbackItem from './FeedbackItem';

const FeedbackList = ({ moduleId }) => {
  const { feedbacks, loadFeedbacks, loading } = useFeedback();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  
  const { items = [], pagination = { total: 0, page: 1, limit: 10, totalPages: 0 } } = feedbacks || {};
  
  // Load feedbacks when page, sort, or order changes
  useEffect(() => {
    loadFeedbacks(moduleId, currentPage, 10, sortBy, order);
  }, [moduleId, currentPage, sortBy, order, loadFeedbacks]);
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === 'newest') {
      setSortBy('createdAt');
      setOrder('desc');
    } else if (value === 'oldest') {
      setSortBy('createdAt');
      setOrder('asc');
    } else if (value === 'highest') {
      setSortBy('rating');
      setOrder('desc');
    } else if (value === 'lowest') {
      setSortBy('rating');
      setOrder('asc');
    }
    setCurrentPage(1); // Reset to first page on sort change
  };
  
  // Loading state
  if (loading.fetch && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }
  
  // Empty state
  if (items.length === 0 && !loading.fetch) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">
          No feedback yet
        </h3>
        <p className="text-sm text-gray-400">
          Be the first to share your thoughts about this module!
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with sort */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {pagination.total} feedback{pagination.total !== 1 ? 's' : ''}
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-gray-400">
            Sort by:
          </label>
          <select
            id="sort"
            onChange={handleSortChange}
            className="px-3 py-2 bg-[#1a1a2e] border border-purple-500/20 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors"
            defaultValue="newest"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest rated</option>
            <option value="lowest">Lowest rated</option>
          </select>
        </div>
      </div>
      
      {/* Feedback list */}
      <div className="space-y-4">
        {items.map((feedback) => (
          <FeedbackItem key={feedback.id} feedback={feedback} />
        ))}
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading.fetch}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] hover:bg-purple-500/10 disabled:bg-gray-800 disabled:cursor-not-allowed border border-purple-500/20 rounded-lg text-sm text-gray-200 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          {/* Page info */}
          <div className="text-sm text-gray-400">
            Page {currentPage} of {pagination.totalPages}
          </div>
          
          {/* Next button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages || loading.fetch}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] hover:bg-purple-500/10 disabled:bg-gray-800 disabled:cursor-not-allowed border border-purple-500/20 rounded-lg text-sm text-gray-200 transition-colors"
            aria-label="Next page"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Loading overlay for page changes */}
      {loading.fetch && items.length > 0 && (
        <div className="absolute inset-0 bg-[#0a0a1a]/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
