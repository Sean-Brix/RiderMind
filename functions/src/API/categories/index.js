import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

import getCategories from '../../Controller/categories/getCategories.js';
import getCategoryById from '../../Controller/categories/getCategoryById.js';
import createCategory from '../../Controller/categories/createCategory.js';
import updateCategory from '../../Controller/categories/updateCategory.js';
import deleteCategory from '../../Controller/categories/deleteCategory.js';
import assignModulesToCategory from '../../Controller/categories/assignModulesToCategory.js';
import addModuleToCategory from '../../Controller/categories/addModuleToCategory.js';
import removeModuleFromCategory from '../../Controller/categories/removeModuleFromCategory.js';
import reorderCategoryModules from '../../Controller/categories/reorderCategoryModules.js';
import bulkAddModulesToCategory from '../../Controller/categories/bulkAddModulesToCategory.js';
import bulkRemoveModulesFromCategory from '../../Controller/categories/bulkRemoveModulesFromCategory.js';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', authenticate, requireRole('ADMIN'), createCategory);
router.put('/:id', authenticate, requireRole('ADMIN'), updateCategory);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteCategory);
router.put('/:id/modules', authenticate, requireRole('ADMIN'), assignModulesToCategory);
router.post('/:id/modules', authenticate, requireRole('ADMIN'), addModuleToCategory);
router.post('/:id/modules/bulk', authenticate, requireRole('ADMIN'), bulkAddModulesToCategory);
router.delete('/:id/modules/bulk', authenticate, requireRole('ADMIN'), bulkRemoveModulesFromCategory);
router.delete('/:id/modules/:moduleId', authenticate, requireRole('ADMIN'), removeModuleFromCategory);
router.patch('/:id/modules/reorder', authenticate, requireRole('ADMIN'), reorderCategoryModules);

export default router;
