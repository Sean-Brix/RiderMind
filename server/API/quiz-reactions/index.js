import express from 'express';
import {
  toggleQuizReaction,
  getQuestionReactionStats,
  getMyQuestionReaction,
  getQuizReactions,
  deleteQuizReaction
} from '../../Controller/Feedback/quizReaction.js';

const router = express.Router();

// Middleware (uncomment when auth is ready)
// import { verifyToken } from '../../Middlewares/JWT/verifyToken.js';

// Apply auth middleware to protected routes
// router.use(verifyToken);

/**
 * @route   POST /api/quiz-questions/:questionId/reaction
 * @desc    Toggle like/dislike on a quiz question
 * @access  Private
 */
router.post('/:questionId/reaction', toggleQuizReaction);

/**
 * @route   GET /api/quiz-questions/:questionId/reactions
 * @desc    Get reaction statistics for a question
 * @access  Public
 */
router.get('/:questionId/reactions', getQuestionReactionStats);

/**
 * @route   GET /api/quiz-questions/:questionId/reaction/my
 * @desc    Get current user's reaction for a question
 * @access  Private
 */
router.get('/:questionId/reaction/my', getMyQuestionReaction);

/**
 * @route   DELETE /api/quiz-questions/:questionId/reaction
 * @desc    Remove reaction from a quiz question
 * @access  Private
 */
router.delete('/:questionId/reaction', deleteQuizReaction);

/**
 * @route   GET /api/quizzes/:quizId/reactions
 * @desc    Get all reactions for all questions in a quiz
 * @access  Private
 */
router.get('/:quizId/reactions', getQuizReactions);

export default router;
