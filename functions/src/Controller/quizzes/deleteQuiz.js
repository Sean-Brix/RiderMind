import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';

export default async function deleteQuiz(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();

    const quizDoc = await db.collection(COLLECTIONS.QUIZZES).doc(id).get();
    const quiz = docToObject(quizDoc);
    if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found' });

    const [qSnap, attSnap] = await Promise.all([
      db.collection(COLLECTIONS.QUIZ_QUESTIONS).where('quizId', '==', id).get(),
      db.collection(COLLECTIONS.QUIZ_ATTEMPTS).where('quizId', '==', id).get(),
    ]);

    const batch = db.batch();
    qSnap.docs.forEach(d => batch.delete(d.ref));
    attSnap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(db.collection(COLLECTIONS.QUIZZES).doc(id));
    await batch.commit();

    res.status(200).json({ success: true, message: 'Quiz deleted successfully', data: { id, title: quiz.title } });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ success: false, error: 'Failed to delete quiz', message: error.message });
  }
}
