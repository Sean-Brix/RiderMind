import express from 'express';
import { authenticate } from '../../middleware/auth.js';
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

router.get('/my-modules', authenticate, getMyModules);
router.get('/progress', authenticate, getProgressModules);
router.post('/enroll', authenticate, enrollInCategory);
router.put('/mark-completed', authenticate, markModulesCompleted);
router.put('/skill-level', authenticate, updateSkillLevel);
router.put('/:moduleId/progress', authenticate, updateProgress);
router.post('/:moduleId/submit-quiz', authenticate, submitQuizAttempt);
router.post('/:moduleId/quiz-attempt', authenticate, recordQuizAttempt);
router.post('/:moduleId/complete', authenticate, completeModule);

export default router;
