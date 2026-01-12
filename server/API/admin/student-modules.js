import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

// Import controllers
import getAllStudentModules from '../../Controller/admin/getAllStudentModules.js';
import getStudentModuleStats from '../../Controller/admin/getStudentModuleStats.js';
import getStudentModuleById from '../../Controller/admin/getStudentModuleById.js';

const router = express.Router();

/**
 * Admin Student Module Routes
 * All routes require authentication and admin role
 */

// Get statistics
router.get('/stats', authenticate, requireRole('ADMIN'), getStudentModuleStats);

// Get all student modules with filtering and pagination
router.get('/', authenticate, requireRole('ADMIN'), getAllStudentModules);

// Get student module by ID
router.get('/:id', authenticate, requireRole('ADMIN'), getStudentModuleById);

export default router;
