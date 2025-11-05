import express from 'express';
import { getModuleFeedbackAnalytics, getQuizReactionAnalytics } from '../../Controller/Analytics/feedbackAnalytics.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

// Admin analytics routes - require authentication
router.get('/feedback/modules', authenticate, getModuleFeedbackAnalytics);
router.get('/feedback/quizzes', authenticate, getQuizReactionAnalytics);

export default router;
