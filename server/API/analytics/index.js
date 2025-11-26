import express from 'express';
import { getModuleFeedbackAnalytics, getQuizReactionAnalytics } from '../../Controller/Analytics/feedbackAnalytics.js';
import getLeaderboard from '../../Controller/Analytics/getLeaderboard.js';
import { getAccountsAnalytics } from '../../Controller/Analytics/accountsAnalytics.js';
import { getLeaderboardAnalytics } from '../../Controller/Analytics/leaderboardAnalytics.js';
import { getQuizzesAnalytics } from '../../Controller/Analytics/quizzesAnalytics.js';
import { getModulesAnalytics } from '../../Controller/Analytics/modulesAnalytics.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/leaderboard', getLeaderboard);

// Admin analytics routes - require authentication
router.get('/accounts', authenticate, getAccountsAnalytics);
router.get('/leaderboard-analytics', authenticate, getLeaderboardAnalytics);
router.get('/quizzes', authenticate, getQuizzesAnalytics);
router.get('/modules', authenticate, getModulesAnalytics);
router.get('/feedback/modules', authenticate, getModuleFeedbackAnalytics);
router.get('/feedback/quizzes', authenticate, getQuizReactionAnalytics);

export default router;
