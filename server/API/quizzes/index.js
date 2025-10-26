import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

// Quiz controllers
import getQuizzes from '../../Controller/quizzes/getQuizzes.js';
import getQuizById from '../../Controller/quizzes/getQuizById.js';
import createQuiz from '../../Controller/quizzes/createQuiz.js';
import updateQuiz from '../../Controller/quizzes/updateQuiz.js';
import deleteQuiz from '../../Controller/quizzes/deleteQuiz.js';

// Question controllers
import addQuestion from '../../Controller/quizzes/addQuestion.js';
import updateQuestion from '../../Controller/quizzes/updateQuestion.js';
import deleteQuestion from '../../Controller/quizzes/deleteQuestion.js';

// Question media controllers
import uploadQuestionVideoController, { uploadQuizVideo } from '../../Controller/quizzes/uploadQuestionVideo.js';
import uploadQuestionImageController, { uploadQuizImage } from '../../Controller/quizzes/uploadQuestionImage.js';
import deleteQuestionVideo from '../../Controller/quizzes/deleteQuestionVideo.js';
import deleteQuestionImage from '../../Controller/quizzes/deleteQuestionImage.js';
import getQuestionImage from '../../Controller/quizzes/getQuestionImage.js';
import streamQuestionVideo from '../../Controller/quizzes/streamQuestionVideo.js';

// Option controllers
import addOption from '../../Controller/quizzes/addOption.js';
import updateOption from '../../Controller/quizzes/updateOption.js';
import deleteOption from '../../Controller/quizzes/deleteOption.js';

// Attempt controllers
import submitQuiz from '../../Controller/quizzes/submitQuiz.js';
import getAttempts from '../../Controller/quizzes/getAttempts.js';
import getAttemptResults from '../../Controller/quizzes/getAttemptResults.js';

const router = Router();

/**
 * QUIZ ROUTES
 */

// Get all quizzes (public access, can filter by moduleId)
// Query params: moduleId, includeQuestions, includeOptions
router.get('/', getQuizzes);

// Get single quiz by ID (public access for students, authenticated admins see correct answers)
// Query params: includeCorrectAnswers (admin only)
router.get('/:id', optionalAuthenticate, getQuizById);

// Create new quiz (ADMIN only)
router.post('/', authenticate, requireRole('ADMIN'), createQuiz);

// Update quiz (ADMIN only)
router.put('/:id', authenticate, requireRole('ADMIN'), updateQuiz);

// Delete quiz (ADMIN only)
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteQuiz);

/**
 * QUESTION ROUTES
 */

// Add question to quiz (ADMIN only)
router.post('/:quizId/questions', authenticate, requireRole('ADMIN'), addQuestion);

// Update question (ADMIN only)
router.put('/questions/:questionId', authenticate, requireRole('ADMIN'), updateQuestion);

// Delete question (ADMIN only)
router.delete('/questions/:questionId', authenticate, requireRole('ADMIN'), deleteQuestion);

/**
 * QUESTION MEDIA ROUTES
 */

// Upload video to question (ADMIN only)
router.put('/questions/:questionId/upload-video', 
  authenticate, 
  requireRole('ADMIN'), 
  uploadQuizVideo.single('video'),
  uploadQuestionVideoController
);

// Upload image to question (ADMIN only)
router.put('/questions/:questionId/upload-image', 
  authenticate, 
  requireRole('ADMIN'), 
  uploadQuizImage.single('image'),
  uploadQuestionImageController
);

// Stream question video (public access for students taking quiz)
router.get('/questions/:questionId/video', streamQuestionVideo);

// Get question image (public access for students taking quiz)
router.get('/questions/:questionId/image', getQuestionImage);

// Delete question video (ADMIN only)
router.delete('/questions/:questionId/video', authenticate, requireRole('ADMIN'), deleteQuestionVideo);

// Delete question image (ADMIN only)
router.delete('/questions/:questionId/image', authenticate, requireRole('ADMIN'), deleteQuestionImage);

/**
 * OPTION ROUTES
 */

// Add option to question (ADMIN only)
router.post('/questions/:questionId/options', authenticate, requireRole('ADMIN'), addOption);

// Update option (ADMIN only)
router.put('/options/:optionId', authenticate, requireRole('ADMIN'), updateOption);

// Delete option (ADMIN only)
router.delete('/options/:optionId', authenticate, requireRole('ADMIN'), deleteOption);

/**
 * QUIZ ATTEMPT ROUTES
 */

// Submit quiz (authenticated users)
router.post('/:quizId/submit', authenticate, submitQuiz);

// Get user's attempts (authenticated users, admins can query other users)
// Query params: userId (admin only), quizId
router.get('/attempts/all', authenticate, getAttempts);

// Get specific attempt results (authenticated users, must own attempt or be admin)
router.get('/attempts/:attemptId', authenticate, getAttemptResults);

export default router;
