import { getDb, COLLECTIONS, docToObject, updateDoc } from '../../db/firestore.js';

export default async function recordQuizAttempt(req, res) {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;
    const { categoryId, quizScore, quizAttemptId, passed } = req.body;
    const db = getDb();

    if (!categoryId || quizScore === undefined) {
      return res.status(400).json({ success: false, error: 'categoryId and quizScore are required' });
    }

    const smSnap = await db.collection(COLLECTIONS.STUDENT_MODULES)
      .where('userId', '==', userId).where('moduleId', '==', moduleId).where('categoryId', '==', categoryId).limit(1).get();

    if (smSnap.empty) return res.status(404).json({ success: false, error: 'Student module not found' });

    const sm = { id: smSnap.docs[0].id, ...smSnap.docs[0].data() };
    const data = { quizAttempts: (sm.quizAttempts || 0) + 1, lastQuizAttemptId: quizAttemptId || null };

    if (!sm.quizScore || quizScore > sm.quizScore) data.quizScore = quizScore;
    if (passed && !sm.quizPassed) data.quizPassed = true;

    await updateDoc(COLLECTIONS.STUDENT_MODULES, sm.id, data);
    const updated = docToObject(await db.collection(COLLECTIONS.STUDENT_MODULES).doc(sm.id).get());
    const modDoc = await db.collection(COLLECTIONS.MODULES).doc(moduleId).get();

    res.status(200).json({ success: true, data: { ...updated, module: docToObject(modDoc) } });
  } catch (error) {
    console.error('Error recording quiz attempt:', error);
    res.status(500).json({ success: false, error: 'Failed to record quiz attempt', message: error.message });
  }
}
