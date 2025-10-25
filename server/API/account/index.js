import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Account' });
});

// Controllers
import createAcc from '../../Controller/account/createAcc.js';
import getAllUser from '../../Controller/account/getAllUser.js';

// Middleware
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

// Admin-only: list all users
router.get('/list', authenticate, requireRole('ADMIN'), getAllUser);

// Admin-only: create a new account
router.post('/', authenticate, requireRole('ADMIN'), createAcc);

export default router;