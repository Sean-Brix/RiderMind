import express from 'express';
import {
  toggleQuizReaction,
  getQuestionReactionStats,
  getMyQuestionReaction,
  getQuizReactions,
  deleteQuizReaction
} from '../../Controller/Feedback/quizReaction.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/quiz-questions/:questionId/reaction
 * @desc    Toggle like/dislike on a quiz question
 * @access  Private
 */
router.post('/:questionId/reaction', authenticate, toggleQuizReaction);

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
router.get('/:questionId/reaction/my', authenticate, getMyQuestionReaction);

/**
 * @route   DELETE /api/quiz-questions/:questionId/reaction
 * @desc    Remove reaction from a quiz question
 * @access  Private
 */
router.delete('/:questionId/reaction', authenticate, deleteQuizReaction);

/**
 * @route   GET /api/quizzes/:quizId/reactions
 * @desc    Get all reactions for all questions in a quiz
 * @access  Private
 */
router.get('/:quizId/reactions', authenticate, getQuizReactions);

export default router;
