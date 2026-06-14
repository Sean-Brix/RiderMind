import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

import getQuizzes from '../../Controller/quizzes/getQuizzes.js';
import getQuizById from '../../Controller/quizzes/getQuizById.js';
import createQuiz from '../../Controller/quizzes/createQuiz.js';
import updateQuiz from '../../Controller/quizzes/updateQuiz.js';
import deleteQuiz from '../../Controller/quizzes/deleteQuiz.js';

import addQuestion from '../../Controller/quizzes/addQuestion.js';
import updateQuestion from '../../Controller/quizzes/updateQuestion.js';
import deleteQuestion from '../../Controller/quizzes/deleteQuestion.js';
import reorderQuestions from '../../Controller/quizzes/reorderQuestions.js';

import uploadQuestionVideoController from '../../Controller/quizzes/uploadQuestionVideo.js';
import uploadQuestionImageController from '../../Controller/quizzes/uploadQuestionImage.js';
import deleteQuestionVideo from '../../Controller/quizzes/deleteQuestionVideo.js';
import deleteQuestionImage from '../../Controller/quizzes/deleteQuestionImage.js';
import getQuestionImage from '../../Controller/quizzes/getQuestionImage.js';
import streamQuestionVideo from '../../Controller/quizzes/streamQuestionVideo.js';

import { uploadQuizVideo, uploadQuizImage } from '../../utils/quizMediaHandler.js';

import addOption from '../../Controller/quizzes/addOption.js';
import updateOption from '../../Controller/quizzes/updateOption.js';
import deleteOption from '../../Controller/quizzes/deleteOption.js';

import submitQuiz from '../../Controller/quizzes/submitQuiz.js';
import getAttempts from '../../Controller/quizzes/getAttempts.js';
import getAttemptResults from '../../Controller/quizzes/getAttemptResults.js';

import { getQuizReactions } from '../../Controller/Feedback/quizReaction.js';

const router = Router();

router.get('/', getQuizzes);
router.get('/:id', optionalAuthenticate, getQuizById);
router.post('/', authenticate, requireRole('ADMIN'), createQuiz);
router.put('/:id', authenticate, requireRole('ADMIN'), updateQuiz);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteQuiz);

router.post('/:quizId/questions', authenticate, requireRole('ADMIN'), addQuestion);
router.put('/questions/:questionId', authenticate, requireRole('ADMIN'), updateQuestion);
router.delete('/questions/:questionId', authenticate, requireRole('ADMIN'), deleteQuestion);
router.patch('/:quizId/questions/reorder', authenticate, requireRole('ADMIN'), reorderQuestions);

router.put('/questions/:questionId/upload-video', authenticate, requireRole('ADMIN'), uploadQuizVideo, uploadQuestionVideoController);
router.put('/questions/:questionId/upload-image', authenticate, requireRole('ADMIN'), uploadQuizImage, uploadQuestionImageController);
router.get('/questions/:questionId/video', streamQuestionVideo);
router.get('/questions/:questionId/image', getQuestionImage);
router.delete('/questions/:questionId/video', authenticate, requireRole('ADMIN'), deleteQuestionVideo);
router.delete('/questions/:questionId/image', authenticate, requireRole('ADMIN'), deleteQuestionImage);

router.post('/questions/:questionId/options', authenticate, requireRole('ADMIN'), addOption);
router.put('/options/:optionId', authenticate, requireRole('ADMIN'), updateOption);
router.delete('/options/:optionId', authenticate, requireRole('ADMIN'), deleteOption);

router.post('/:quizId/submit', authenticate, submitQuiz);
router.get('/attempts/all', authenticate, getAttempts);
router.get('/attempts/:attemptId', authenticate, getAttemptResults);

router.get('/:quizId/reactions', authenticate, requireRole('ADMIN'), getQuizReactions);

export default router;
