import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';
import { uploadVideo } from '../../utils/videoHandler.js';
import { uploadImage } from '../../utils/imageHandler.js';

import getModules from '../../Controller/modules/getModules.js';
import getModuleById from '../../Controller/modules/getModuleById.js';
import createModule from '../../Controller/modules/createModule.js';
import updateModule from '../../Controller/modules/updateModule.js';
import deleteModule from '../../Controller/modules/deleteModule.js';
import duplicateModule from '../../Controller/modules/duplicateModule.js';

import addObjective from '../../Controller/modules/addObjective.js';
import updateObjective from '../../Controller/modules/updateObjective.js';
import deleteObjective from '../../Controller/modules/deleteObjective.js';
import reorderObjectives from '../../Controller/modules/reorderObjectives.js';

import addSlide from '../../Controller/modules/addSlide.js';
import updateSlide from '../../Controller/modules/updateSlide.js';
import deleteSlide from '../../Controller/modules/deleteSlide.js';
import reorderSlides from '../../Controller/modules/reorderSlides.js';
import getSlideImage from '../../Controller/modules/getSlideImage.js';
import streamSlideVideo from '../../Controller/modules/streamSlideVideo.js';
import uploadSlideVideo from '../../Controller/modules/uploadSlideVideo.js';
import uploadSlideImage from '../../Controller/modules/uploadSlideImage.js';

const router = Router();

router.get('/', getModules);
router.get('/:id', getModuleById);
router.post('/', authenticate, requireRole('ADMIN'), createModule);
router.put('/:id', authenticate, requireRole('ADMIN'), updateModule);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteModule);
router.post('/:id/duplicate', authenticate, requireRole('ADMIN'), duplicateModule);

router.post('/:moduleId/objectives', authenticate, requireRole('ADMIN'), addObjective);
router.put('/objectives/:objectiveId', authenticate, requireRole('ADMIN'), updateObjective);
router.delete('/objectives/:objectiveId', authenticate, requireRole('ADMIN'), deleteObjective);
router.patch('/:moduleId/objectives/reorder', authenticate, requireRole('ADMIN'), reorderObjectives);

router.post('/:moduleId/slides', authenticate, requireRole('ADMIN'), addSlide);
router.put('/slides/:slideId', authenticate, requireRole('ADMIN'), updateSlide);
router.delete('/slides/:slideId', authenticate, requireRole('ADMIN'), deleteSlide);
router.patch('/:moduleId/slides/reorder', authenticate, requireRole('ADMIN'), reorderSlides);
router.get('/slides/:slideId/image', getSlideImage);
router.get('/slides/:slideId/video', streamSlideVideo);
router.post('/slides/:slideId/image', authenticate, requireRole('ADMIN'), uploadImage.single('image'), uploadSlideImage);
router.post('/slides/:slideId/video', authenticate, requireRole('ADMIN'), uploadVideo.single('video'), uploadSlideVideo);

export default router;
