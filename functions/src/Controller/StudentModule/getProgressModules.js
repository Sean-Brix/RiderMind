import { getDb, COLLECTIONS, snapshotToArray, docToObject } from '../../db/firestore.js';

export default async function getProgressModules(req, res) {
  try {
    const userId = req.user.id;
    const db = getDb();

    const smSnap = await db.collection(COLLECTIONS.STUDENT_MODULES).where('userId', '==', userId).get();
    const studentModules = snapshotToArray(smSnap).sort((a, b) => {
      const d = (b.createdAt || '').localeCompare(a.createdAt || '');
      return d !== 0 ? d : a.position - b.position;
    });

    if (!studentModules.length) {
      return res.status(200).json({ success: true, data: { modules: [], stats: { total: 0, completed: 0, inProgress: 0, notStarted: 0, completionRate: 0 } } });
    }

    const enriched = await Promise.all(studentModules.map(async sm => {
      const [modDoc, catDoc] = await Promise.all([
        db.collection(COLLECTIONS.MODULES).doc(sm.moduleId).get(),
        db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(sm.categoryId).get(),
      ]);
      const mod = docToObject(modDoc);
      const cat = docToObject(catDoc);
      let module = null;
      if (mod) {
        const [objSnap, qSnap] = await Promise.all([
          db.collection(COLLECTIONS.MODULE_OBJECTIVES).where('moduleId', '==', sm.moduleId).orderBy('position', 'asc').get(),
          db.collection(COLLECTIONS.QUIZZES).where('moduleId', '==', sm.moduleId).where('isActive', '==', true).get(),
        ]);
        module = { ...mod, objectives: snapshotToArray(objSnap), quizzes: snapshotToArray(qSnap).map(q => ({ id: q.id, title: q.title, passingScore: q.passingScore })) };
      }
      return { ...sm, module, category: cat };
    }));

    const total = enriched.length;
    const stats = {
      total,
      completed: enriched.filter(m => m.isCompleted).length,
      inProgress: enriched.filter(m => m.progress > 0 && !m.isCompleted).length,
      notStarted: enriched.filter(m => m.progress === 0).length,
      avgProgress: enriched.reduce((acc, m) => acc + (m.progress || 0), 0) / total,
      completionRate: (enriched.filter(m => m.isCompleted).length / total) * 100,
    };

    res.status(200).json({ success: true, data: { modules: enriched, stats } });
  } catch (error) {
    console.error('Error fetching progress modules:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch progress data', message: error.message });
  }
}
