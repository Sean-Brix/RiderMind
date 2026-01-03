import express from 'express';
import { authenticate } from '../../middleware/auth.js';

// Import controllers
import getMyModules from '../../Controller/StudentModule/getMyModules.js';
import getProgressModules from '../../Controller/StudentModule/getProgressModules.js';
import updateProgress from '../../Controller/StudentModule/updateProgress.js';
import completeModule from '../../Controller/StudentModule/completeModule.js';
import recordQuizAttempt from '../../Controller/StudentModule/recordQuizAttempt.js';
import submitQuizAttempt from '../../Controller/StudentModule/submitQuizAttempt.js';
import updateSkillLevel from '../../Controller/StudentModule/updateSkillLevel.js';
import enrollInCategory from '../../Controller/StudentModule/enrollInCategory.js';
import markModulesCompleted from '../../Controller/StudentModule/markModulesCompleted.js';

const router = express.Router();

/**
 * Student Module Routes
 * All routes require authentication
 */

// Get student's ONGOING modules (for learning page)
router.get('/my-modules', authenticate, getMyModules);

// Get all modules for progress tracking (both ONGOING and COMPLETED)
router.get('/progress', authenticate, getProgressModules);

// Manually enroll in a category with skill level selection
router.post('/enroll', authenticate, enrollInCategory);

// Mark current modules as completed (to get a new module)
router.put('/mark-completed', authenticate, markModulesCompleted);

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
