/**
 * FeedbackForm Component
 * 
 * Unified feedback interface - submit your own + view all feedbacks in one place
 */

import { useState, useEffect } from 'react';
import { Star, Send, Loader2, MessageSquare, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useFeedback } from '../../contexts/FeedbackContext';
import { formatDistanceToNow } from 'date-fns';

const FeedbackForm = ({ moduleId }) => {
  const { myFeedback, feedbacks, submitFeedback, deleteFeedback, loadMyFeedback, loadFeedbacks, loading } = useFeedback();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showAllFeedbacks, setShowAllFeedbacks] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Load data on mount and when moduleId changes
  useEffect(() => {
    if (moduleId) {
      loadMyFeedback(moduleId);
      loadFeedbacks(moduleId, 1, 50);
    }
  }, [moduleId, loadMyFeedback, loadFeedbacks]);
  
  // Update form when myFeedback changes
  useEffect(() => {
    if (myFeedback) {
      setRating(myFeedback.rating);
      setComment(myFeedback.comment);
    } else {
      setRating(0);
      setComment('');
    }
  }, [myFeedback]);
  
  const charLimit = 500;
  const charCount = comment.length;
  const isValid = rating > 0 && comment.trim().length >= 10 && charCount <= charLimit;
  
  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    
    const result = await submitFeedback(moduleId, { 
      rating, 
      comment: comment.trim() 
    });
    
    if (result.success) {
      // Reload feedbacks to show the new one
      loadFeedbacks(moduleId, 1, 50);
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    const result = await deleteFeedback(moduleId);
    if (result.success) {
      // Reload feedbacks to update the list
      await loadFeedbacks(moduleId, 1, 50);
      setShowDeleteConfirm(false);
      setRating(0);
      setComment('');
    }
  };
  
  // Render stars
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoverRating || rating);
      
      return (
        <button
          key={index}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
          aria-label={`Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              isFilled
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-600 hover:text-gray-400'
            }`}
          />
        </button>
      );
    });
  };
  // Render read-only view
  if (myFeedback && !isEditing) {
    return (
      <div className="space-y-6">
        <div className="bg-[#1a1a2e] border border-purple-500/20 rounded-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-100">Your Feedback</h3>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
            >
              Edit
            </button>
          </div>

          {/* Rating */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  className={`w-6 h-6 ${
                    index < rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-600'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-400">
                {rating} star{rating !== 1 ? 's' : ''}
              </span>
            </div>
            {rating >= 4 ? (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <ThumbsUp className="w-4 h-4" />
                <span>You like this module</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <ThumbsDown className="w-4 h-4" />
                <span>You didn't like this module</span>
              </div>
            )}
          </div>

          {/* Comment */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-300 mb-2">Your Comment:</p>
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
              {comment}
            </p>
          </div>

          {/* Delete button */}
          {!showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-4 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Feedback
            </button>
          )}

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-3">
              <p className="text-sm text-red-400">
                Are you sure you want to delete your feedback? This action cannot be undone.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading.delete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading.delete ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Yes, Delete'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading.delete}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render edit form
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {myFeedback && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-100">Edit Your Feedback</h3>
          <button
            type="button"
            onClick={() => {
              setRating(myFeedback.rating);
              setComment(myFeedback.comment);
              setIsEditing(false);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
          How would you rate this module?
        </label>
        <div className="flex items-center gap-2">
          {renderStars()}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-400">
              {rating} star{rating !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      
      {/* Like/Dislike Indicator */}
      {rating > 0 && (
        <div className="flex items-center gap-2 text-sm">
          {isLike ? (
            <>
              <ThumbsUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400">You like this module</span>
            </>
          ) : (
            <>
              <ThumbsDown className="w-4 h-4 text-red-400" />
              <span className="text-red-400">You dislike this module</span>
            </>
          )}
        </div>
      )}
      
      {/* Comment */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Share your thoughts
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you think about this module? What could be improved?"
          className="w-full h-32 px-4 py-3 bg-white dark:bg-[#0a0a1a] border border-gray-300 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors resize-none"
          aria-describedby="char-count"
          aria-invalid={!isCharValid && charCount > 0}
        />
        
        {/* Character count */}
        <div
          id="char-count"
          className={`mt-2 text-sm ${
            charCount < charMin
              ? 'text-gray-500'
              : charCount > charLimit
              ? 'text-red-400'
              : 'text-green-400'
          }`}
        >
          {charCount} / {charLimit} characters
          {charCount < charMin && ` (minimum ${charMin})`}
        </div>
      </div>
      
      {/* Error messages */}
      {(validationError || error) && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400"
        >
          {validationError || error}
        </div>
      )}
      
      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Submit button */}
        <button
          type="submit"
          disabled={loading.submit || rating === 0 || !isCharValid}
          className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading.submit ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {myFeedback ? 'Updating...' : 'Submitting...'}
            </>
          ) : (
            myFeedback ? 'Update Feedback' : 'Submit Feedback'
          )}
        </button>
        
        {/* Delete button */}
        {myFeedback && !showDeleteConfirm && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete
          </button>
        )}
      </div>
      
      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-3">
          <p className="text-sm text-red-400">
            Are you sure you want to delete your feedback? This action cannot be undone.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading.delete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {loading.delete ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Yes, Delete'
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={loading.delete}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default FeedbackForm;
