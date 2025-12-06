/**
 * FeedbackStats Component
 * 
 * Displays statistics and analytics for module feedback.
 */

import { Star, ThumbsUp, ThumbsDown, MessageSquare, TrendingUp } from 'lucide-react';
import { useFeedback } from '../../contexts/FeedbackContext';

const FeedbackStats = () => {
  const { stats } = useFeedback();
  
  const {
    totalFeedbacks,
    averageRating,
    totalLikes,
    totalDislikes,
    ratingDistribution,
  } = stats;
  
  // Calculate percentages for rating distribution
  const ratingPercentages = Object.entries(ratingDistribution).map(([rating, count]) => ({
    rating: parseInt(rating),
    count,
    percentage: totalFeedbacks > 0 ? (count / totalFeedbacks) * 100 : 0,
  })).reverse(); // Show 5 stars at top
  
  // Calculate like percentage
  const likePercentage = totalFeedbacks > 0
    ? (totalLikes / totalFeedbacks) * 100
    : 0;
  
  // Empty state
  if (totalFeedbacks === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">
          No statistics yet
        </h3>
        <p className="text-sm text-gray-400">
          Statistics will appear once feedback is submitted
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Average rating */}
        <div className="bg-[#1a1a2e] border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Star className="w-4 h-4" />
            Average
          </div>
          <div className="text-3xl font-bold text-purple-400">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={`w-3 h-3 ${
                  index < Math.round(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Total feedbacks */}
        <div className="bg-[#1a1a2e] border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <MessageSquare className="w-4 h-4" />
            Total
          </div>
          <div className="text-3xl font-bold text-gray-200">
            {totalFeedbacks}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            feedback{totalFeedbacks !== 1 ? 's' : ''}
          </div>
        </div>
        
        {/* Likes */}
        <div className="bg-[#1a1a2e] border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <ThumbsUp className="w-4 h-4" />
            Likes
          </div>
          <div className="text-3xl font-bold text-green-400">
            {totalLikes}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {likePercentage.toFixed(0)}%
          </div>
        </div>
        
        {/* Dislikes */}
        <div className="bg-[#1a1a2e] border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <ThumbsDown className="w-4 h-4" />
            Dislikes
          </div>
          <div className="text-3xl font-bold text-red-400">
            {totalDislikes}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {(100 - likePercentage).toFixed(0)}%
          </div>
        </div>
      </div>
      
      {/* Like/Dislike ratio bar */}
      <div className="bg-[#1a1a2e] border border-purple-500/20 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-200 mb-4">
          Like/Dislike Ratio
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-8 bg-[#0a0a1a] rounded-full overflow-hidden flex">
            {/* Likes bar */}
            <div
              className="bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-center text-xs font-semibold text-white transition-all duration-500"
              style={{ width: `${likePercentage}%` }}
            >
              {likePercentage > 10 && `${likePercentage.toFixed(0)}%`}
            </div>
            
            {/* Dislikes bar */}
            <div
              className="bg-gradient-to-r from-red-500 to-red-400 flex items-center justify-center text-xs font-semibold text-white transition-all duration-500"
              style={{ width: `${100 - likePercentage}%` }}
            >
              {(100 - likePercentage) > 10 && `${(100 - likePercentage).toFixed(0)}%`}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{totalLikes} likes</span>
          <span>{totalDislikes} dislikes</span>
        </div>
      </div>
      
      {/* Rating distribution */}
      <div className="bg-[#1a1a2e] border border-purple-500/20 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-200 mb-4">
          Rating Distribution
        </h3>
        <div className="space-y-3">
          {ratingPercentages.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-4">
              {/* Star label */}
              <div className="flex items-center gap-1 w-16 text-sm text-gray-400">
                {rating}
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              </div>
              
              {/* Progress bar */}
              <div className="flex-1 h-6 bg-[#0a0a1a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 flex items-center px-3 text-xs font-semibold text-white transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 10 && `${percentage.toFixed(0)}%`}
                </div>
              </div>
              
              {/* Count */}
              <div className="w-12 text-sm text-gray-400 text-right">
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Summary */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              Overall Performance
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {averageRating >= 4.5 && (
                <>This module is performing exceptionally well with an average rating of {averageRating.toFixed(1)} stars and {likePercentage.toFixed(0)}% positive feedback!</>
              )}
              {averageRating >= 3.5 && averageRating < 4.5 && (
                <>This module is performing well with an average rating of {averageRating.toFixed(1)} stars. There's room for improvement based on user feedback.</>
              )}
              {averageRating < 3.5 && (
                <>This module has an average rating of {averageRating.toFixed(1)} stars. Consider reviewing user feedback to identify areas for improvement.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackStats;
