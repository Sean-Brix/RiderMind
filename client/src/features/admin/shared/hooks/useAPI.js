import { useState, useCallback } from 'react';
import { useToast } from './useToast';

/**
 * Generic API hook with loading, error handling, and toast notifications
 * @returns {Object} { execute, loading, error }
 */
export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const execute = useCallback(async (apiCall, options = {}) => {
    const {
      onSuccess,
      onError,
      successMessage,
      errorMessage = 'An error occurred',
      showSuccessToast = true,
      showErrorToast = true
    } = options;

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      
      if (showSuccessToast && successMessage) {
        showToast(successMessage, 'success');
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || errorMessage;
      setError(errorMsg);
      
      if (showErrorToast) {
        showToast(errorMsg, 'error');
      }
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return { execute, loading, error };
};
