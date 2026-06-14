import express from 'express';
import {
  submitModuleFeedback,
  getModuleFeedback,
  getModuleFeedbackStats,
  getMyModuleFeedback,
  deleteModuleFeedback,
  getAllModuleFeedback
} from '../../Controller/Feedback/moduleFeedback.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';

const router = express.Router();

router.get('/all', authenticate, getAllModuleFeedback);
router.post('/:moduleId/feedback', authenticate, submitModuleFeedback);
router.get('/:moduleId/feedback', getModuleFeedback);
router.get('/:moduleId/feedback/stats', getModuleFeedbackStats);
router.get('/:moduleId/feedback/my', authenticate, getMyModuleFeedback);
router.delete('/:moduleId/feedback', authenticate, deleteModuleFeedback);

export default router;
