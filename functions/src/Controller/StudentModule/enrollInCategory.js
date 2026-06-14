import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

const SKILL_RANK = { Beginner: 1, Intermediate: 2, Expert: 3 };

export default async function enrollInCategory(req, res) {
  try {
    const userId = req.user.id;
    const { categoryId, skillLevel = 'Beginner' } = req.body;
    const db = getDb();

    if (!categoryId) return res.status(400).json({ success: false, message: 'Category ID is required' });
    const valid = ['Beginner', 'Intermediate', 'Expert'];
    if (!valid.includes(skillLevel)) return res.status(400).json({ success: false, message: 'Invalid skill level' });

    const catDoc = await db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(categoryId).get();
    if (!docToObject(catDoc)) return res.status(404).json({ success: false, message: 'Category not found' });

    let catModSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).where('categoryId', '==', categoryId).orderBy('position', 'asc').get();
    let catMods = snapshotToArray(catModSnap);

    if (catMods.length === 0) {
      const allModSnap = await db.collection(COLLECTIONS.MODULES).where('isActive', '==', true).orderBy('position', 'asc').get();
      catMods = snapshotToArray(allModSnap).map((m, i) => ({ moduleId: m.id, position: i + 1 }));
    }

    if (catMods.length === 0) return res.status(404).json({ success: false, message: 'No modules found in this category' });

    const ts = new Date().toISOString();
    const batch = db.batch();
    const studentModules = [];

    for (const cm of catMods) {
      const ref = db.collection(COLLECTIONS.STUDENT_MODULES).doc();
      const data = {
        userId, categoryId, moduleId: cm.moduleId, position: cm.position, status: 'ONGOING',
        skillLevel, isCompleted: false, progress: 0, currentSlideId: null, startedAt: null,
        completedAt: null, quizScore: null, quizPassed: false, quizAttempts: 0, lastQuizAttemptId: null,
        createdAt: ts, updatedAt: ts,
      };
      batch.set(ref, data);
      studentModules.push({ id: ref.id, ...data });
    }
    await batch.commit();

    // Filter slides by skill level for the response
    const enriched = await Promise.all(studentModules.map(async sm => {
      const modDoc = await db.collection(COLLECTIONS.MODULES).doc(sm.moduleId).get();
      const mod = docToObject(modDoc);
      if (!mod) return { ...sm, module: null };
      const [objSnap, slideSnap] = await Promise.all([
        db.collection(COLLECTIONS.MODULE_OBJECTIVES).where('moduleId', '==', sm.moduleId).get(),
        db.collection(COLLECTIONS.MODULE_SLIDES).where('moduleId', '==', sm.moduleId).orderBy('position', 'asc').get(),
      ]);
      const studentRank = SKILL_RANK[skillLevel] || 1;
      const slides = snapshotToArray(slideSnap).filter(s => (SKILL_RANK[s.skillLevel] || 1) <= studentRank);
      return { ...sm, module: { ...mod, objectives: snapshotToArray(objSnap), slides } };
    }));

    res.status(201).json({ success: true, message: `Successfully enrolled in course with ${skillLevel} level`, data: { modules: enriched, enrolledCount: enriched.length, skillLevel } });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ success: false, message: 'Failed to enroll in category', error: error.message });
  }
}
