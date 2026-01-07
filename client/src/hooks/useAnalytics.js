import { useQuery } from '@tanstack/react-query';
import {
  getAccountsAnalytics,
  getLeaderboardAnalytics,
  getQuizzesAnalytics,
  getModulesAnalytics,
  getModuleFeedbackAnalytics,
  getQuizReactionAnalytics
} from '../services/analyticsService';

// Cache times
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Hook for accounts analytics data
 */
export function useAccountsAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'accounts'],
    queryFn: getAccountsAnalytics,
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Hook for leaderboard analytics data
 */
export function useLeaderboardAnalytics(limit = 10) {
  return useQuery({
    queryKey: ['analytics', 'leaderboard', limit],
    queryFn: () => getLeaderboardAnalytics(limit),
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Hook for quizzes analytics data
 */
export function useQuizzesAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'quizzes'],
    queryFn: getQuizzesAnalytics,
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Hook for modules analytics data
 */
export function useModulesAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'modules'],
    queryFn: getModulesAnalytics,
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Hook for module feedback analytics data
 */
export function useModuleFeedbackAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'feedback', 'modules'],
    queryFn: getModuleFeedbackAnalytics,
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Hook for quiz reaction analytics data
 */
export function useQuizReactionAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'feedback', 'quizzes'],
    queryFn: getQuizReactionAnalytics,
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Hook for overview analytics (only what's needed for overview)
 * This fetches just the summary data needed for the overview page
 */
export function useOverviewAnalytics() {
  const accountsQuery = useAccountsAnalytics();
  const leaderboardQuery = useLeaderboardAnalytics(10);
  
  return {
    accounts: accountsQuery,
    leaderboard: leaderboardQuery,
    isLoading: accountsQuery.isLoading || leaderboardQuery.isLoading,
    isError: accountsQuery.isError || leaderboardQuery.isError,
    error: accountsQuery.error || leaderboardQuery.error,
  };
}
