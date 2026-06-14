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

router.post('/:questionId/reaction', authenticate, toggleQuizReaction);
router.get('/:questionId/reactions', getQuestionReactionStats);
router.get('/:questionId/reaction/my', authenticate, getMyQuestionReaction);
router.delete('/:questionId/reaction', authenticate, deleteQuizReaction);
router.get('/:quizId/reactions', authenticate, getQuizReactions);

export default router;
