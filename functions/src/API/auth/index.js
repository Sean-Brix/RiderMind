import express from 'express';
import login from '../../Controller/auth/login.js';
import forgotPassword from '../../Controller/auth/forgotPassword.js';
import { validateResetToken, resetPassword } from '../../Controller/auth/resetPassword.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';
import {
  submitRegistration,
  getRegistrationRequests,
  getRegistrationRequest,
  approveRegistration,
  rejectRegistration,
  deleteRegistrationRequest
} from '../../Controller/Authentication/registerRequest.js';
import { uploadReceipt, parseReceiptUpload } from '../../Controller/Authentication/uploadReceipt.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', submitRegistration);
router.post('/forgot-password', forgotPassword);
router.get('/validate-reset-token', validateResetToken);
router.post('/reset-password', resetPassword);

router.get('/registration-requests', authenticate, requireRole('ADMIN'), getRegistrationRequests);
router.get('/registration-requests/:id', authenticate, requireRole('ADMIN'), getRegistrationRequest);
router.post('/registration-requests/:id/upload-receipt', authenticate, requireRole('ADMIN'), parseReceiptUpload, uploadReceipt);
router.post('/registration-requests/:id/approve', authenticate, requireRole('ADMIN'), approveRegistration);
router.post('/registration-requests/:id/reject', authenticate, requireRole('ADMIN'), rejectRegistration);
router.delete('/registration-requests/:id', authenticate, requireRole('ADMIN'), deleteRegistrationRequest);

export default router;
