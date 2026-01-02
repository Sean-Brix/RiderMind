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
import addModuleToCategory from '../../Controller/categories/addModuleToCategory.js';
import removeModuleFromCategory from '../../Controller/categories/removeModuleFromCategory.js';
import reorderCategoryModules from '../../Controller/categories/reorderCategoryModules.js';

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

// Assign modules to category - replace all (ADMIN only)
router.put('/:id/modules', authenticate, requireRole('ADMIN'), assignModulesToCategory);

// Add a single module to category (ADMIN only)
router.post('/:id/modules', authenticate, requireRole('ADMIN'), addModuleToCategory);

// Remove a module from category (ADMIN only)
router.delete('/:id/modules/:moduleId', authenticate, requireRole('ADMIN'), removeModuleFromCategory);

// Reorder modules in category (ADMIN only)
router.patch('/:id/modules/reorder', authenticate, requireRole('ADMIN'), reorderCategoryModules);

export default router;
