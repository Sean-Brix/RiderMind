import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// Mount feature routes
import accountRouter from './account/index.js';
import quizFormRouter from './quiz_form/index.js';
import authRouter from './auth/index.js';

router.use('/auth', authRouter);
router.use('/account', accountRouter);
router.use('/quiz_form', quizFormRouter);

export default router;