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
import uploadProfilePictureController from '../../Controller/account/uploadProfilePicture.js';
import deleteProfilePictureController from '../../Controller/account/deleteProfilePicture.js';

// Middleware
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

// Utils
import { uploadProfilePicture } from '../../utils/profilePictureHandler.js';

// Admin-only: list all users
router.get('/list', authenticate, requireRole('ADMIN'), getAllUser);

// Admin-only: create a new account
router.post('/', authenticate, requireRole('ADMIN'), createAcc);

// Get a user - users can access their own profile, admins can access any
router.get('/:id', authenticate, getUserById);

// Update a user - users can update their own profile, admins can update any
router.put('/:id', authenticate, updateAcc);

// Admin-only: delete a user
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteAcc);

// Profile picture routes - users can manage their own, admins can manage any
router.post('/:id/profile-picture', authenticate, uploadProfilePicture.single('profilePicture'), uploadProfilePictureController);
router.delete('/:id/profile-picture', authenticate, deleteProfilePictureController);

export default router;