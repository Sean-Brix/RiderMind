import { getDb, COLLECTIONS, snapshotToArray, docToObject } from '../../db/firestore.js';

const SKILL_RANK = { Beginner: 1, Intermediate: 2, Expert: 3 };

async function fetchModuleDetails(db, sm) {
  const modDoc = await db.collection(COLLECTIONS.MODULES).doc(sm.moduleId).get();
  const mod = docToObject(modDoc);
  if (!mod) return { ...sm, module: null };

  const [objSnap, slideSnap, quizSnap] = await Promise.all([
    db.collection(COLLECTIONS.MODULE_OBJECTIVES).where('moduleId', '==', sm.moduleId).orderBy('position', 'asc').get(),
    db.collection(COLLECTIONS.MODULE_SLIDES).where('moduleId', '==', sm.moduleId).orderBy('position', 'asc').get(),
    db.collection(COLLECTIONS.QUIZZES).where('moduleId', '==', sm.moduleId).where('isActive', '==', true).get(),
  ]);

  const studentRank = SKILL_RANK[sm.skillLevel] || 1;
  const allSlides = snapshotToArray(slideSnap);
  const filteredSlides = allSlides.filter(s => (SKILL_RANK[s.skillLevel] || 1) <= studentRank);

  const quizzes = await Promise.all(snapshotToArray(quizSnap).map(async q => {
    const qSnap = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).where('quizId', '==', q.id).orderBy('position', 'asc').get();
    return { ...q, questions: snapshotToArray(qSnap) };
  }));

  return { ...sm, module: { ...mod, objectives: snapshotToArray(objSnap), slides: filteredSlides, quizzes } };
}

export default async function getMyModules(req, res) {
  try {
    const userId = req.user.id;
    let { categoryId, checkOnly } = req.query;
    const db = getDb();

    if (!categoryId) {
      const ongoingSnap = await db.collection(COLLECTIONS.STUDENT_MODULES)
        .where('userId', '==', userId).where('status', '==', 'ONGOING').limit(1).get();
      if (!ongoingSnap.empty) {
        categoryId = ongoingSnap.docs[0].data().categoryId;
      } else {
        let catSnap = await db.collection(COLLECTIONS.MODULE_CATEGORIES).where('isDefault', '==', true).where('isActive', '==', true).limit(1).get();
        if (catSnap.empty) catSnap = await db.collection(COLLECTIONS.MODULE_CATEGORIES).where('isActive', '==', true).orderBy('createdAt', 'asc').limit(1).get();
        if (catSnap.empty) return res.status(404).json({ success: false, error: 'No active categories found' });
        categoryId = catSnap.docs[0].id;
      }
    }

    let smSnap = await db.collection(COLLECTIONS.STUDENT_MODULES)
      .where('userId', '==', userId).where('categoryId', '==', categoryId).where('status', '==', 'ONGOING').get();
    let studentModules = snapshotToArray(smSnap).sort((a, b) => a.position - b.position);

    if (studentModules.length === 0) {
      if (checkOnly === 'true') {
        return res.json({ success: true, data: { modules: [], category: null, progress: { total: 0, completed: 0, completionPercentage: 0 } } });
      }

      let catModSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).where('categoryId', '==', categoryId).orderBy('position', 'asc').get();
      let catMods = snapshotToArray(catModSnap);

      if (catMods.length === 0) {
        const allModSnap = await db.collection(COLLECTIONS.MODULES).where('isActive', '==', true).orderBy('position', 'asc').get();
        catMods = snapshotToArray(allModSnap).map((m, i) => ({ moduleId: m.id, position: i + 1 }));
      }

      if (catMods.length === 0) return res.status(404).json({ success: false, error: 'No modules found in this category' });

      const ts = new Date().toISOString();
      const batch = db.batch();
      catMods.forEach(cm => {
        const ref = db.collection(COLLECTIONS.STUDENT_MODULES).doc();
        batch.set(ref, { userId, categoryId, moduleId: cm.moduleId, position: cm.position, status: 'ONGOING', skillLevel: 'Beginner', isCompleted: false, progress: 0, currentSlideId: null, startedAt: null, completedAt: null, quizScore: null, quizPassed: false, quizAttempts: 0, lastQuizAttemptId: null, createdAt: ts, updatedAt: ts });
      });
      await batch.commit();

      smSnap = await db.collection(COLLECTIONS.STUDENT_MODULES).where('userId', '==', userId).where('categoryId', '==', categoryId).where('status', '==', 'ONGOING').get();
      studentModules = snapshotToArray(smSnap).sort((a, b) => a.position - b.position);
    }

    const catDoc = await db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(categoryId).get();
    const category = docToObject(catDoc);

    const modules = await Promise.all(studentModules.map(sm => fetchModuleDetails(db, sm)));
    const total = modules.length;
    const completed = modules.filter(m => m.isCompleted).length;

    res.status(200).json({ success: true, data: { category, modules, progress: { total, completed, completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0 } } });
  } catch (error) {
    console.error('Error fetching student modules:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch student modules', message: error.message });
  }
}
