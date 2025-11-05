import express from 'express';
import login from '../../Controller/auth/login.js';
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

const router = express.Router();

// Public login
router.post('/login', login);

// Public registration
router.post('/register', submitRegistration);

// Admin-only registration management routes
router.get('/registration-requests', authenticate, requireRole('ADMIN'), getRegistrationRequests);
router.get('/registration-requests/:id', authenticate, requireRole('ADMIN'), getRegistrationRequest);
router.post('/registration-requests/:id/approve', authenticate, requireRole('ADMIN'), approveRegistration);
router.post('/registration-requests/:id/reject', authenticate, requireRole('ADMIN'), rejectRegistration);
router.delete('/registration-requests/:id', authenticate, requireRole('ADMIN'), deleteRegistrationRequest);

export default router;
