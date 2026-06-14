import { getDb, COLLECTIONS, docToObject, updateDoc } from '../../db/firestore.js';

export default async function completeModule(req, res) {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params; // This is the studentModuleId
    const { categoryId, quizScore, quizAttemptId } = req.body;
    const db = getDb();

    if (!categoryId) return res.status(400).json({ success: false, error: 'categoryId is required' });

    const smDoc = await db.collection(COLLECTIONS.STUDENT_MODULES).doc(moduleId).get();
    const sm = docToObject(smDoc);
    if (!sm) return res.status(404).json({ success: false, error: 'Student module not found' });
    if (sm.userId !== userId) return res.status(403).json({ success: false, error: 'Unauthorized' });

    const quizSnap = await db.collection(COLLECTIONS.QUIZZES).where('moduleId', '==', sm.moduleId).where('isActive', '==', true).limit(1).get();
    const passingScore = quizSnap.empty ? 70 : (quizSnap.docs[0].data().passingScore || 70);
    const passed = quizScore >= passingScore;

    if (!passed) {
      return res.status(400).json({ success: false, error: `Quiz score (${quizScore}%) is below passing score (${passingScore}%)`, quizScore, passingScore, passed: false });
    }

    await updateDoc(COLLECTIONS.STUDENT_MODULES, moduleId, {
      isCompleted: true, completedAt: new Date().toISOString(), progress: 100,
      quizScore, quizPassed: true, quizAttempts: (sm.quizAttempts || 0) + 1,
      lastQuizAttemptId: quizAttemptId || null,
      startedAt: sm.startedAt || new Date().toISOString(),
    });

    const updated = docToObject(await db.collection(COLLECTIONS.STUDENT_MODULES).doc(moduleId).get());
    const modDoc = await db.collection(COLLECTIONS.MODULES).doc(sm.moduleId).get();
    const catDoc = await db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(sm.categoryId).get();

    res.status(200).json({ success: true, message: 'Module completed successfully!', data: { ...updated, module: docToObject(modDoc), category: docToObject(catDoc) } });
  } catch (error) {
    console.error('Error completing module:', error);
    res.status(500).json({ success: false, error: 'Failed to complete module', message: error.message });
  }
}
