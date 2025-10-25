import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';
import { uploadVideo } from '../../utils/videoHandler.js';

// Module controllers
import getModules from '../../Controller/modules/getModules.js';
import getModuleById from '../../Controller/modules/getModuleById.js';
import createModule from '../../Controller/modules/createModule.js';
import updateModule from '../../Controller/modules/updateModule.js';
import deleteModule from '../../Controller/modules/deleteModule.js';

// Objective controllers
import addObjective from '../../Controller/modules/addObjective.js';
import updateObjective from '../../Controller/modules/updateObjective.js';
import deleteObjective from '../../Controller/modules/deleteObjective.js';

// Slide controllers
import addSlide from '../../Controller/modules/addSlide.js';
import updateSlide from '../../Controller/modules/updateSlide.js';
import deleteSlide from '../../Controller/modules/deleteSlide.js';
import getSlideImage from '../../Controller/modules/getSlideImage.js';
import streamSlideVideo from '../../Controller/modules/streamSlideVideo.js';
import uploadSlideVideo from '../../Controller/modules/uploadSlideVideo.js';

const router = Router();

/**
 * MODULE ROUTES
 */

// Get all modules (public access for users, filtering available)
router.get('/', getModules);

// Get single module by ID (public access)
router.get('/:id', getModuleById);

// Create new module (ADMIN only)
router.post('/', authenticate, requireRole('ADMIN'), createModule);

// Update module (ADMIN only)
router.put('/:id', authenticate, requireRole('ADMIN'), updateModule);

// Delete module (ADMIN only)
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteModule);

/**
 * OBJECTIVE ROUTES
 */

// Add objective to module (ADMIN only)
router.post('/:moduleId/objectives', authenticate, requireRole('ADMIN'), addObjective);

// Update objective (ADMIN only)
router.put('/objectives/:objectiveId', authenticate, requireRole('ADMIN'), updateObjective);

// Delete objective (ADMIN only)
router.delete('/objectives/:objectiveId', authenticate, requireRole('ADMIN'), deleteObjective);

/**
 * SLIDE ROUTES
 */

// Add slide to module (ADMIN only)
router.post('/:moduleId/slides', authenticate, requireRole('ADMIN'), addSlide);

// Update slide (ADMIN only)
router.put('/slides/:slideId', authenticate, requireRole('ADMIN'), updateSlide);

// Delete slide (ADMIN only)
router.delete('/slides/:slideId', authenticate, requireRole('ADMIN'), deleteSlide);

// Get slide image (public access)
router.get('/slides/:slideId/image', getSlideImage);

// Stream slide video (public access, supports range requests)
router.get('/slides/:slideId/video', streamSlideVideo);

// Upload video to slide (ADMIN only, multipart/form-data)
router.post('/slides/:slideId/video', authenticate, requireRole('ADMIN'), uploadVideo.single('video'), uploadSlideVideo);

export default router;
