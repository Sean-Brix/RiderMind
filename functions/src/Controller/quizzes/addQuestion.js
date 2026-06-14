import { v4 as uuidv4 } from 'uuid';
import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';

export default async function addQuestion(req, res) {
  try {
    const { quizId } = req.params;
    const { type, question, points, position, explanation, caseSensitive, shuffleOptions,
      imageUrl, imagePath, imageMime, videoUrl, videoPath, options } = req.body;
    const db = getDb();

    if (!type || !question) return res.status(400).json({ success: false, error: 'Type and question are required' });

    const quizDoc = await db.collection(COLLECTIONS.QUIZZES).doc(quizId).get();
    if (!docToObject(quizDoc)) return res.status(404).json({ success: false, error: 'Quiz not found' });

    const countSnap = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).where('quizId', '==', quizId).get();
    const ts = new Date().toISOString();
    const opts = (options || []).map((opt, i) => ({
      id: uuidv4(), optionText: opt.optionText, isCorrect: opt.isCorrect || false,
      position: opt.position || i + 1, imageUrl: opt.imageUrl || null,
      imagePath: opt.imagePath || null, imageMime: opt.imageMime || null,
    }));

    const qRef = db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc();
    const qData = {
      quizId, type, question, points: points || 1, position: position || countSnap.size + 1,
      explanation: explanation || null, caseSensitive: caseSensitive || false,
      shuffleOptions: shuffleOptions !== undefined ? shuffleOptions : false,
      imageUrl: imageUrl || null, imagePath: imagePath || null, imageMime: imageMime || null,
      videoUrl: videoUrl || null, videoPath: videoPath || null, options: opts, createdAt: ts, updatedAt: ts,
    };
    await qRef.set(qData);

    res.status(201).json({ success: true, message: 'Question added successfully', data: { id: qRef.id, ...qData } });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ success: false, error: 'Failed to add question', message: error.message });
  }
}
