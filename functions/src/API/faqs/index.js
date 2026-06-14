import express from 'express';
import getAllFAQs from '../../Controller/FAQ/getAllFAQs.js';
import getFAQById from '../../Controller/FAQ/getFAQById.js';
import createFAQ from '../../Controller/FAQ/createFAQ.js';
import updateFAQ from '../../Controller/FAQ/updateFAQ.js';
import deleteFAQ from '../../Controller/FAQ/deleteFAQ.js';
import getFAQsByCategory from '../../Controller/FAQ/getFAQsByCategory.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

const router = express.Router();

router.get('/', getAllFAQs);
router.get('/category/:category', getFAQsByCategory);
router.get('/:id', getFAQById);
router.post('/', authenticate, requireRole('ADMIN'), createFAQ);
router.put('/:id', authenticate, requireRole('ADMIN'), updateFAQ);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteFAQ);

export default router;
