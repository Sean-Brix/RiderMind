import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { authenticate } from '../../middleware/auth.js';
import { uploadFile } from '../../utils/firebase.js';
import generateModules from '../../Controller/dev/generateModules.js';
import clearAllModules from '../../Controller/dev/clearModules.js';
import generateQuizzes from '../../Controller/dev/generateQuizzes.js';
import clearQuizzesController from '../../Controller/dev/clearQuizzes.js';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

// POST /api/dev/test-firebase-upload - Test Firebase Storage upload
router.post('/test-firebase-upload', authenticate, upload.any(), async (req, res) => {
  try {
    // Get the uploaded file (either 'video' or 'image' field)
    const file = req.files && req.files[0];
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;
    const storagePath = `test-uploads/${filename}`;
    
    const result = await uploadFile(
      file.buffer,
      storagePath,
      file.mimetype
    );
    
    console.log(`✅ Test file uploaded: ${storagePath}`);
    
    res.json({
      success: true,
      url: result.url,
      path: result.path,
      filename: filename,
      size: file.size,
      type: file.mimetype
    });
  } catch (error) {
    console.error('❌ Error in test upload:', error);
    res.status(500).json({
      error: 'Failed to process upload',
      details: error.message
    });
  }
});

// DELETE /api/dev/clear-student-modules - Delete all student modules
router.delete('/clear-student-modules', authenticate, async (req, res) => {
  try {
    // Delete all student modules
    const result = await prisma.studentModule.deleteMany({});
    
    console.log(`🗑️ Deleted ${result.count} student modules (requested by user ${req.user.id})`);
    
    res.json({
      success: true,
      message: 'All student modules deleted successfully',
      deletedCount: result.count
    });
  } catch (error) {
    console.error('❌ Error deleting student modules:', error);
    res.status(500).json({
      error: 'Failed to delete student modules',
      details: error.message
    });
  }
});

// POST /api/dev/generate-modules - Generate 10 sample modules
router.post('/generate-modules', authenticate, generateModules);

// DELETE /api/dev/clear-modules - Clear all modules
router.delete('/clear-modules', authenticate, clearAllModules);

// POST /api/dev/generate-quizzes - Generate quizzes for all modules
router.post('/generate-quizzes', authenticate, generateQuizzes);

// DELETE /api/dev/clear-quizzes - Clear all quizzes
router.delete('/clear-quizzes', authenticate, clearQuizzesController);

export default router;
