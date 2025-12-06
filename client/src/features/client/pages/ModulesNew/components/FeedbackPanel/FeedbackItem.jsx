/**
 * FeedbackItem Component
 * 
 * Displays a single feedback item with user info, rating, and comment.
 */

import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const FeedbackItem = ({ feedback }) => {
  const { user, rating, comment, createdAt } = feedback;
  
  // Generate user initials
  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U';
  
  // Format relative time
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  
  // Render star rating
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-600'
        }`}
      />
    ));
  };
  
  return (
    <div className="bg-[#1a1a2e] border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/40 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-semibold">
            {initials}
          </div>
          
          {/* User info */}
          <div>
            <div className="text-sm font-medium text-gray-100">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-xs text-gray-500">
              {timeAgo}
            </div>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1">
          {renderStars()}
        </div>
      </div>
      
      {/* Comment */}
      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
        {comment}
      </p>
    </div>
  );
};

export default FeedbackItem;
