import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Account' });
});

// Controllers
import createAcc from '../../Controller/account/createAcc.js';
import getAllUser from '../../Controller/account/getAllUser.js';
import getUserById from '../../Controller/account/getUserById.js';
import updateAcc from '../../Controller/account/updateAcc.js';
import deleteAcc from '../../Controller/account/deleteAcc.js';

// Middleware
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

// Admin-only: list all users
router.get('/list', authenticate, requireRole('ADMIN'), getAllUser);

// Admin-only: create a new account
router.post('/', authenticate, requireRole('ADMIN'), createAcc);

// Admin-only: get a single user
router.get('/:id', authenticate, requireRole('ADMIN'), getUserById);

// Admin-only: update a user
router.put('/:id', authenticate, requireRole('ADMIN'), updateAcc);

// Admin-only: delete a user
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteAcc);

export default router;