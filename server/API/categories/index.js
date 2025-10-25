import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

// Category controllers
import getCategories from '../../Controller/categories/getCategories.js';
import getCategoryById from '../../Controller/categories/getCategoryById.js';
import createCategory from '../../Controller/categories/createCategory.js';
import updateCategory from '../../Controller/categories/updateCategory.js';
import deleteCategory from '../../Controller/categories/deleteCategory.js';
import assignModulesToCategory from '../../Controller/categories/assignModulesToCategory.js';

const router = Router();

/**
 * CATEGORY ROUTES
 */

// Get all categories (public access)
router.get('/', getCategories);

// Get single category by ID (public access)
router.get('/:id', getCategoryById);

// Create new category (ADMIN only)
router.post('/', authenticate, requireRole('ADMIN'), createCategory);

// Update category (ADMIN only)
router.put('/:id', authenticate, requireRole('ADMIN'), updateCategory);

// Delete category (ADMIN only)
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteCategory);

// Assign modules to category (ADMIN only)
router.put('/:id/modules', authenticate, requireRole('ADMIN'), assignModulesToCategory);

export default router;
