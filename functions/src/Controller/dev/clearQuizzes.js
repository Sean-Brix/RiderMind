import { getDb, COLLECTIONS, snapshotToArray } from '../../db/firestore.js';

export default async function clearQuizzesController(req, res) {
  try {
    const db = getDb();
    const quizSnap = await db.collection(COLLECTIONS.QUIZZES).get();
    if (quizSnap.empty) return res.status(400).json({ success: false, error: 'No quizzes to clear' });

    const count = quizSnap.size;
    let totalDeleted = 0;

    for (const quizDoc of quizSnap.docs) {
      const [qSnap, aSnap] = await Promise.all([
        db.collection(COLLECTIONS.QUIZ_QUESTIONS).where('quizId', '==', quizDoc.id).get(),
        db.collection(COLLECTIONS.QUIZ_ATTEMPTS).where('quizId', '==', quizDoc.id).get(),
      ]);
      const batch = db.batch();
      qSnap.docs.forEach(d => batch.delete(d.ref));
      aSnap.docs.forEach(d => batch.delete(d.ref));
      batch.delete(quizDoc.ref);
      await batch.commit();
      totalDeleted += qSnap.size + aSnap.size + 1;
    }

    res.status(200).json({ success: true, message: `Cleared ${count} quizzes successfully`, data: { quizzesDeleted: count, totalDocumentsDeleted: totalDeleted } });
  } catch (error) {
    console.error('Error clearing quizzes:', error);
    res.status(500).json({ success: false, error: 'Failed to clear quizzes', message: error.message });
  }
}
