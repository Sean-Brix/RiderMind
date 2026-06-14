import express from 'express';
import multer from 'multer';
import { authenticate } from '../../middleware/auth.js';
import { uploadFile } from '../../utils/storage.js';
import generateModules from '../../Controller/dev/generateModules.js';
import clearAllModules from '../../Controller/dev/clearModules.js';
import generateQuizzes from '../../Controller/dev/generateQuizzes.js';
import clearQuizzesController from '../../Controller/dev/clearQuizzes.js';
import sendTestEmail from '../../Controller/dev/sendTestEmail.js';
import { getDb, COLLECTIONS, snapshotToArray } from '../../db/firestore.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

router.post('/test-firebase-upload', authenticate, upload.any(), async (req, res) => {
  try {
    const file = req.files && req.files[0];
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;
    const storagePath = `test-uploads/${filename}`;
    const result = await uploadFile(file.buffer, storagePath, file.mimetype);
    res.json({ success: true, url: result.url, path: result.path, filename, size: file.size, type: file.mimetype });
  } catch (error) {
    console.error('❌ Error in test upload:', error);
    res.status(500).json({ error: 'Failed to process upload', details: error.message });
  }
});

router.delete('/clear-student-modules', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection(COLLECTIONS.STUDENT_MODULES).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    res.json({ success: true, message: 'All student modules deleted successfully', deletedCount: snapshot.size });
  } catch (error) {
    console.error('❌ Error deleting student modules:', error);
    res.status(500).json({ error: 'Failed to delete student modules', details: error.message });
  }
});

router.post('/generate-modules', authenticate, generateModules);
router.delete('/clear-modules', authenticate, clearAllModules);
router.post('/generate-quizzes', authenticate, generateQuizzes);
router.delete('/clear-quizzes', authenticate, clearQuizzesController);
router.post('/send-test-email', authenticate, sendTestEmail);

export default router;
