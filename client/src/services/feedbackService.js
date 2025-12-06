/**
 * Feedback Service
 * 
 * Handles all API calls related to module feedback.
 * Includes retry logic and error handling.
 */

const BASE_URL = '/api/modules';

/**
 * Retry helper for failed requests
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retry attempts
 * @param {number} delay - Delay between retries in ms
 */
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

/**
 * Handle API response
 * @param {Response} response - Fetch response
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  
  return data;
};

/**
 * Submit or update module feedback
 * @param {number} moduleId - Module ID
 * @param {Object} feedbackData - Feedback data
 * @param {number} feedbackData.rating - Rating (1-5)
 * @param {string} feedbackData.comment - Comment (10-1000 chars)
 * @returns {Promise<Object>} API response
 */
export const submitFeedback = async (moduleId, { rating, comment }) => {
  return retryRequest(async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/${moduleId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ rating, comment }),
    });
    
    return handleResponse(response);
  });
};

/**
 * Get all feedbacks for a module (paginated)
 * @param {number} moduleId - Module ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {string} sortBy - Sort field (default: 'createdAt')
 * @param {string} order - Sort order (default: 'desc')
 * @returns {Promise<Object>} API response with feedbacks and pagination
 */
export const getFeedbacks = async (
  moduleId,
  page = 1,
  limit = 10,
  sortBy = 'createdAt',
  order = 'desc'
) => {
  return retryRequest(async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      order,
    });
    
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${BASE_URL}/${moduleId}/feedback?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      }
    );
    
    return handleResponse(response);
  });
};

/**
 * Get statistics for a module's feedback
 * @param {number} moduleId - Module ID
 * @returns {Promise<Object>} API response with statistics
 */
export const getStats = async (moduleId) => {
  return retryRequest(async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${BASE_URL}/${moduleId}/feedback/stats`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      }
    );
    
    return handleResponse(response);
  });
};

/**
 * Get user's own feedback for a module
 * @param {number} moduleId - Module ID
 * @returns {Promise<Object>} API response with user's feedback
 */
export const getMyFeedback = async (moduleId) => {
  return retryRequest(async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${BASE_URL}/${moduleId}/feedback/my`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      }
    );
    
    return handleResponse(response);
  });
};

/**
 * Delete user's feedback for a module (soft delete)
 * @param {number} moduleId - Module ID
 * @returns {Promise<Object>} API response
 */
export const deleteFeedback = async (moduleId) => {
  return retryRequest(async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${BASE_URL}/${moduleId}/feedback`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      }
    );
    
    return handleResponse(response);
  });
};

/**
 * Validate feedback data before submission
 * @param {number} rating - Rating value
 * @param {string} comment - Comment text
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
export const validateFeedback = (rating, comment) => {
  const errors = [];
  
  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    errors.push('Rating must be between 1 and 5 stars');
  }
  
  // Validate comment
  if (!comment || comment.trim().length < 10) {
    errors.push('Comment must be at least 10 characters');
  }
  
  if (comment && comment.length > 1000) {
    errors.push('Comment must not exceed 1000 characters');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

export default {
  submitFeedback,
  getFeedbacks,
  getStats,
  getMyFeedback,
  deleteFeedback,
  validateFeedback,
};
