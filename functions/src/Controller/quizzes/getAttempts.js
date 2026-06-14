import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function getAttempts(req, res) {
  try {
    const { userId: queryUserId, quizId } = req.query;
    const currentUserId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';
    const db = getDb();

    let userId = currentUserId;
    if (queryUserId && isAdmin) {
      userId = queryUserId;
    } else if (queryUserId && !isAdmin) {
      return res.status(403).json({ success: false, error: "You do not have permission to view other users' attempts" });
    }

    let query = db.collection(COLLECTIONS.QUIZ_ATTEMPTS).where('userId', '==', userId);
    if (quizId) query = query.where('quizId', '==', quizId);

    const snap = await query.get();
    let attempts = snapshotToArray(snap);

    // Sort by submittedAt desc
    attempts.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));

    // Fetch quiz info for each
    const quizIds = [...new Set(attempts.map(a => a.quizId))];
    const quizMap = {};
    await Promise.all(quizIds.map(async qid => {
      const qDoc = await db.collection(COLLECTIONS.QUIZZES).doc(qid).get();
      const quiz = docToObject(qDoc);
      if (quiz) {
        let module = null;
        if (quiz.moduleId) {
          const mDoc = await db.collection(COLLECTIONS.MODULES).doc(quiz.moduleId).get();
          if (mDoc.exists) module = { id: mDoc.id, title: mDoc.data().title };
        }
        quizMap[qid] = { id: quiz.id, title: quiz.title, passingScore: quiz.passingScore, module };
      }
    }));

    attempts = attempts.map(a => ({
      ...a, answers: undefined,
      quiz: quizMap[a.quizId] || null, _count: { answers: (a.answers || []).length },
    }));

    res.status(200).json({ success: true, count: attempts.length, data: attempts });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch attempts', message: error.message });
  }
}
