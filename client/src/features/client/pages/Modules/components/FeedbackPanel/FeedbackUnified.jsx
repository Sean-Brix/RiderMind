/**
 * FeedbackUnified Component
 * 
 * Single unified feedback interface:
 * - Submit/update your rating and comment
 * - View all community feedbacks below
 */

import { useState, useEffect } from 'react';
import { Star, Send, Loader2, MessageSquare } from 'lucide-react';
import { useFeedback } from '../../contexts/FeedbackContext';
import { formatDistanceToNow } from 'date-fns';

const FeedbackUnified = ({ moduleId }) => {
  const { myFeedback, feedbacks, submitFeedback, loadMyFeedback, loadFeedbacks, loading } = useFeedback();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Load data when module changes
  useEffect(() => {
    if (moduleId) {
      setRating(0);
      setComment('');
      setIsEditing(false);
      loadMyFeedback(moduleId);
      loadFeedbacks(moduleId, 1, 50);
    }
  }, [moduleId, loadMyFeedback, loadFeedbacks]);
  
  // Populate form when myFeedback loads
  useEffect(() => {
    if (myFeedback) {
      setRating(myFeedback.rating);
      setComment(myFeedback.comment);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [myFeedback]);
  
  const charLimit = 500;
  const charCount = comment.length;
  const isValid = rating > 0 && comment.trim().length >= 10 && charCount <= charLimit;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    
    const result = await submitFeedback(moduleId, { rating, comment: comment.trim() });
    if (result.success) {
      // Reload both my feedback and all feedbacks
      await loadMyFeedback(moduleId);
      await loadFeedbacks(moduleId, 1, 50);
    }
  };
  
  const renderStars = (interactive = true) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (interactive ? (hoverRating || rating) : rating);
      
      return (
        <button
          key={index}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRating(starValue)}
          onMouseEnter={() => interactive && setHoverRating(starValue)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            className={`w-5 h-5 ${
              isFilled
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      );
    });
  };
  
  const allFeedbacks = feedbacks?.items || [];
  const otherFeedbacks = allFeedbacks.filter(f => f.id !== myFeedback?.id);
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-neutral-900">
      {/* Your Feedback Section */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 p-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Your Feedback
        </h3>
        
        {myFeedback && !isEditing ? (
          // Static display of submitted feedback
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {rating} {rating === 1 ? 'star' : 'stars'}
                </span>
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap mb-3">
                {comment}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Edit feedback
              </button>
            </div>
          </div>
        ) : (
          // Editable form
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Rating
              </label>
              <div className="flex items-center gap-1">
                {renderStars(true)}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                    {rating} {rating === 1 ? 'star' : 'stars'}
                  </span>
                )}
              </div>
            </div>
            
            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this module... (minimum 10 characters)"
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg 
                         bg-white dark:bg-neutral-800 
                         text-neutral-900 dark:text-neutral-100 
                         placeholder-neutral-400 dark:placeholder-neutral-500
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         resize-none"
              />
              <div className={`text-xs mt-1 ${
                charCount > charLimit ? 'text-red-500' : 'text-neutral-500 dark:text-neutral-400'
              }`}>
                {charCount} / {charLimit} characters
                {comment.trim().length > 0 && comment.trim().length < 10 && (
                  <span className="text-amber-500 ml-2">• Minimum 10 characters</span>
                )}
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || loading.submit}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700
                       text-white disabled:text-neutral-500 font-medium rounded-lg
                       transition-colors flex items-center justify-center gap-2
                       disabled:cursor-not-allowed"
            >
              {loading.submit ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {myFeedback ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {myFeedback ? 'Update Feedback' : 'Submit Feedback'}
                </>
              )}
            </button>
          </form>
        )}
      </div>
      
      {/* All Feedbacks Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Community Feedback
          </h3>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {allFeedbacks.length} {allFeedbacks.length === 1 ? 'review' : 'reviews'}
          </span>
        </div>
        
        {loading.fetch && allFeedbacks.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : allFeedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-3" />
            <p className="text-neutral-500 dark:text-neutral-400">
              No feedback yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Show user's feedback first if exists */}
            {myFeedback && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                      You
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        Your Review
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatDistanceToNow(new Date(myFeedback.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(false)}
                  </div>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                  {myFeedback.comment}
                </p>
              </div>
            )}
            
            {/* Other feedbacks */}
            {otherFeedbacks.map((feedback) => {
              const initials = `${feedback.user?.first_name?.[0] || ''}${feedback.user?.last_name?.[0] || ''}`.toUpperCase() || 'U';
              
              return (
                <div key={feedback.id} className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center text-neutral-700 dark:text-neutral-300 text-sm font-semibold">
                        {initials}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          {feedback.user?.first_name} {feedback.user?.last_name}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < feedback.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                    {feedback.comment}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackUnified;
