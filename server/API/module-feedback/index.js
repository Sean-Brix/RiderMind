import express from 'express';
import {
  submitModuleFeedback,
  getModuleFeedback,
  getModuleFeedbackStats,
  getMyModuleFeedback,
  deleteModuleFeedback
} from '../../Controller/Feedback/moduleFeedback.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/modules/:moduleId/feedback
 * @desc    Submit or update module feedback
 * @access  Private (requires authentication)
 */
router.post('/:moduleId/feedback', authenticate, submitModuleFeedback);

/**
 * @route   GET /api/modules/:moduleId/feedback
 * @desc    Get all feedback for a module (paginated)
 * @access  Public
 */
router.get('/:moduleId/feedback', getModuleFeedback);

/**
 * @route   GET /api/modules/:moduleId/feedback/stats
 * @desc    Get feedback statistics for a module
 * @access  Public
 */
router.get('/:moduleId/feedback/stats', getModuleFeedbackStats);

/**
 * @route   GET /api/modules/:moduleId/feedback/my
 * @desc    Get current user's feedback for a module
 * @access  Private (requires authentication)
 */
router.get('/:moduleId/feedback/my', authenticate, getMyModuleFeedback);

/**
 * @route   DELETE /api/modules/:moduleId/feedback
 * @desc    Delete (soft delete) module feedback
 * @access  Private (requires authentication)
 */
router.delete('/:moduleId/feedback', authenticate, deleteModuleFeedback);

export default router;
