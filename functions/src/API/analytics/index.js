import express from 'express';
import { getModuleFeedbackAnalytics, getQuizReactionAnalytics } from '../../Controller/analytics/feedbackAnalytics.js';
import getLeaderboard from '../../Controller/analytics/getLeaderboard.js';
import { getAccountsAnalytics } from '../../Controller/analytics/accountsAnalytics.js';
import { getLeaderboardAnalytics } from '../../Controller/analytics/leaderboardAnalytics.js';
import { getQuizzesAnalytics } from '../../Controller/analytics/quizzesAnalytics.js';
import { getModulesAnalytics } from '../../Controller/analytics/modulesAnalytics.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/accounts', authenticate, getAccountsAnalytics);
router.get('/leaderboard-analytics', authenticate, getLeaderboardAnalytics);
router.get('/quizzes', authenticate, getQuizzesAnalytics);
router.get('/modules', authenticate, getModulesAnalytics);
router.get('/feedback/modules', authenticate, getModuleFeedbackAnalytics);
router.get('/feedback/quizzes', authenticate, getQuizReactionAnalytics);

export default router;
