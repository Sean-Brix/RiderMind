import express from 'express';
import { authenticate } from '../../middleware/auth.js';

// Import controllers
import getMyModules from '../../Controller/StudentModule/getMyModules.js';
import updateProgress from '../../Controller/StudentModule/updateProgress.js';
import completeModule from '../../Controller/StudentModule/completeModule.js';
import recordQuizAttempt from '../../Controller/StudentModule/recordQuizAttempt.js';
import submitQuizAttempt from '../../Controller/StudentModule/submitQuizAttempt.js';
import updateSkillLevel from '../../Controller/StudentModule/updateSkillLevel.js';

const router = express.Router();

/**
 * Student Module Routes
 * All routes require authentication
 */

// Get student's modules (auto-enrolls if not enrolled)
router.get('/my-modules', authenticate, getMyModules);

// Update student's skill level (affects which slides are shown)
router.put('/skill-level', authenticate, updateSkillLevel);

// Update progress on a module
router.put('/:moduleId/progress', authenticate, updateProgress);

// Submit quiz attempt (new proper submission)
router.post('/:moduleId/submit-quiz', authenticate, submitQuizAttempt);

// Record a quiz attempt (deprecated - use submit-quiz instead)
router.post('/:moduleId/quiz-attempt', authenticate, recordQuizAttempt);

// Complete a module (after passing quiz)
router.post('/:moduleId/complete', authenticate, completeModule);

export default router;
