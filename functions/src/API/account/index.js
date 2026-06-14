import express from 'express';
import createAcc from '../../Controller/account/createAcc.js';
import getAllUser from '../../Controller/account/getAllUser.js';
import getUserById from '../../Controller/account/getUserById.js';
import updateAcc from '../../Controller/account/updateAcc.js';
import deleteAcc from '../../Controller/account/deleteAcc.js';
import uploadProfilePictureController from '../../Controller/account/uploadProfilePicture.js';
import deleteProfilePictureController from '../../Controller/account/deleteProfilePicture.js';
import getMyDetails from '../../Controller/account/getMyDetails.js';
import updateMyDetails from '../../Controller/account/updateMyDetails.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';
import { uploadProfilePicture } from '../../utils/profilePictureHandler.js';

const router = express.Router();

router.get('/me', authenticate, getMyDetails);
router.put('/me', authenticate, updateMyDetails);
router.get('/list', authenticate, requireRole('ADMIN'), getAllUser);
router.post('/', authenticate, requireRole('ADMIN'), createAcc);
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateAcc);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteAcc);
router.post('/:id/profile-picture', authenticate, uploadProfilePicture.single('profilePicture'), uploadProfilePictureController);
router.delete('/:id/profile-picture', authenticate, deleteProfilePictureController);

export default router;
