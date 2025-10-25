import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// Mount feature routes
import accountRouter from './account/index.js';
import quizFormRouter from './quiz_form/index.js';
import authRouter from './auth/index.js';
import modulesRouter from './modules/index.js';
import categoriesRouter from './categories/index.js';
import quizzesRouter from './quizzes/index.js';

router.use('/auth', authRouter);
router.use('/account', accountRouter);
router.use('/quiz_form', quizFormRouter);
router.use('/modules', modulesRouter);
router.use('/categories', categoriesRouter);
router.use('/quizzes', quizzesRouter);

export default router;