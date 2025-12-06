/**
 * FeedbackContext
 * 
 * Centralized state management for module feedback system.
 * Provides actions for submitting, loading, and deleting feedback.
 * Implements optimistic updates for better UX.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import * as feedbackService from '../../../../../services/feedbackService';

const FeedbackContext = createContext(null);

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
};

export const FeedbackProvider = ({ children }) => {
  // State
  const [currentModuleId, setCurrentModuleId] = useState(null);
  const [myFeedback, setMyFeedback] = useState(null);
  const [feedbacks, setFeedbacks] = useState({
    items: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
  });
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    averageRating: 0,
    totalLikes: 0,
    totalDislikes: 0,
    totalComments: 0,
    ratingDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  });
  const [loading, setLoading] = useState({
    submit: false,
    fetch: false,
    delete: false,
  });
  const [error, setError] = useState(null);

  /**
   * Submit or update feedback with optimistic update
   */
  const submitFeedback = useCallback(async (moduleId, { rating, comment }) => {
    // Validate
    const validation = feedbackService.validateFeedback(rating, comment);
    if (!validation.valid) {
      setError(validation.errors.join('. '));
      return { success: false, error: validation.errors.join('. ') };
    }

    // Clear previous error
    setError(null);

    // Optimistic update
    const optimisticFeedback = {
      id: myFeedback?.id || Date.now(),
      moduleId,
      rating,
      comment: comment.trim(),
      isLike: rating >= 4,
      isActive: true,
      createdAt: myFeedback?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const previousFeedback = myFeedback;
    setMyFeedback(optimisticFeedback);
    setLoading(prev => ({ ...prev, submit: true }));

    try {
      // Submit to API
      const response = await feedbackService.submitFeedback(moduleId, {
        rating,
        comment,
      });

      if (response.success) {
        // Update with server response
        setMyFeedback(response.data);
        
        // Reload stats to get updated counts
        await loadStats(moduleId);
        
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Failed to submit feedback');
      }
    } catch (err) {
      // Revert optimistic update on error
      setMyFeedback(previousFeedback);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  }, [myFeedback]);

  /**
   * Load user's own feedback for a module
   */
  const loadMyFeedback = useCallback(async (moduleId) => {
    setLoading(prev => ({ ...prev, fetch: true }));
    setError(null);

    try {
      const response = await feedbackService.getMyFeedback(moduleId);
      
      if (response.success) {
        setMyFeedback(response.data);
        return { success: true, data: response.data };
      } else {
        // No feedback found (404) is not an error state
        setMyFeedback(null);
        return { success: true, data: null };
      }
    } catch (err) {
      // 404 means no feedback yet - not an error
      if (err.message.includes('No feedback found')) {
        setMyFeedback(null);
        return { success: true, data: null };
      }
      
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, []);

  /**
   * Load all feedbacks for a module (paginated)
   */
  const loadFeedbacks = useCallback(async (
    moduleId,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc'
  ) => {
    // Clear feedbacks if switching modules
    if (currentModuleId !== moduleId) {
      setFeedbacks({
        items: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });
      setCurrentModuleId(moduleId);
    }

    setLoading(prev => ({ ...prev, fetch: true }));
    setError(null);

    try {
      const response = await feedbackService.getFeedbacks(
        moduleId,
        page,
        limit,
        sortBy,
        order
      );

      if (response.success) {
        // Backend returns { feedbacks, pagination }, map to { items, pagination }
        const mappedData = {
          items: response.data.feedbacks || [],
          pagination: response.data.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        };
        setFeedbacks(mappedData);
        return { success: true, data: mappedData };
      } else {
        throw new Error(response.message || 'Failed to load feedbacks');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, [currentModuleId]);

  /**
   * Load statistics for a module
   */
  const loadStats = useCallback(async (moduleId) => {
    setLoading(prev => ({ ...prev, fetch: true }));
    setError(null);

    try {
      const response = await feedbackService.getStats(moduleId);

      if (response.success) {
        setStats(response.data);
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Failed to load statistics');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, []);

  /**
   * Delete user's feedback with optimistic update
   */
  const deleteFeedback = useCallback(async (moduleId) => {
    if (!myFeedback) {
      return { success: false, error: 'No feedback to delete' };
    }

    setError(null);

    // Optimistic update
    const previousFeedback = myFeedback;
    setMyFeedback(null);
    setLoading(prev => ({ ...prev, delete: true }));

    try {
      const response = await feedbackService.deleteFeedback(moduleId);

      if (response.success) {
        // Reload stats to get updated counts
        await loadStats(moduleId);
        
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to delete feedback');
      }
    } catch (err) {
      // Revert optimistic update on error
      setMyFeedback(previousFeedback);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  }, [myFeedback, loadStats]);

  /**
   * Clear all feedback state (when closing modal or switching modules)
   */
  const clearFeedback = useCallback(() => {
    setMyFeedback(null);
    setFeedbacks({
      items: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });
    setStats({
      totalFeedbacks: 0,
      averageRating: 0,
      totalLikes: 0,
      totalDislikes: 0,
      totalComments: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    });
    setError(null);
    setLoading({
      submit: false,
      fetch: false,
      delete: false,
    });
  }, []);

  /**
   * Load all feedback data for a module
   * Convenient method to load everything at once
   */
  const loadAllFeedbackData = useCallback(async (moduleId) => {
    setLoading({
      submit: false,
      fetch: true,
      delete: false,
    });
    setError(null);

    try {
      // Load all data in parallel
      const [myResult, feedbacksResult, statsResult] = await Promise.all([
        loadMyFeedback(moduleId),
        loadFeedbacks(moduleId, 1, 10),
        loadStats(moduleId),
      ]);

      const allSuccessful = myResult.success && feedbacksResult.success && statsResult.success;
      
      if (!allSuccessful) {
        const errors = [
          !myResult.success && myResult.error,
          !feedbacksResult.success && feedbacksResult.error,
          !statsResult.success && statsResult.error,
        ].filter(Boolean);
        
        throw new Error(errors.join('. '));
      }

      return {
        success: true,
        data: {
          myFeedback: myResult.data,
          feedbacks: feedbacksResult.data,
          stats: statsResult.data,
        },
      };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, [loadMyFeedback, loadFeedbacks, loadStats]);

  const value = {
    // State
    myFeedback,
    feedbacks,
    stats,
    loading,
    error,
    
    // Actions
    submitFeedback,
    loadMyFeedback,
    loadFeedbacks,
    loadStats,
    deleteFeedback,
    clearFeedback,
    loadAllFeedbackData,
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
};

export default FeedbackContext;
