import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function reorderQuestions(req, res) {
  try {
    const { quizId } = req.params;
    const { questions } = req.body;
    const db = getDb();

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, error: 'Questions array is required' });
    }

    const quizDoc = await db.collection(COLLECTIONS.QUIZZES).doc(quizId).get();
    if (!docToObject(quizDoc)) return res.status(404).json({ success: false, error: 'Quiz not found' });

    const batch = db.batch();
    const ts = new Date().toISOString();
    questions.forEach(({ id, position }) => {
      batch.update(db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(id), { position, updatedAt: ts });
    });
    await batch.commit();

    const updatedSnap = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).where('quizId', '==', quizId).orderBy('position', 'asc').get();
    res.status(200).json({ success: true, data: snapshotToArray(updatedSnap) });
  } catch (error) {
    console.error('Error reordering questions:', error);
    res.status(500).json({ success: false, error: 'Failed to reorder questions', message: error.message });
  }
}
