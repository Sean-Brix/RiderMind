import { getDb, COLLECTIONS, snapshotToArray } from '../../db/firestore.js';

export default async function getModules(req, res) {
  try {
    const { isActive, includeObjectives, includeSlides } = req.query;
    const db = getDb();

    let query = db.collection(COLLECTIONS.MODULES).orderBy('position', 'asc');
    if (isActive !== undefined) query = query.where('isActive', '==', isActive === 'true');

    const snapshot = await query.get();
    let modules = snapshotToArray(snapshot);

    // Fetch category assignments for all modules
    const categoryModulesSnapshot = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).get();
    const allCategoryModules = snapshotToArray(categoryModulesSnapshot);

    // Fetch all categories for lookup
    const categoriesSnapshot = await db.collection(COLLECTIONS.MODULE_CATEGORIES).get();
    const categoriesMap = {};
    categoriesSnapshot.docs.forEach(doc => { categoriesMap[doc.id] = { id: doc.id, ...doc.data() }; });

    // Fetch quizzes for all modules
    const quizzesSnapshot = await db.collection(COLLECTIONS.QUIZZES).get();
    const allQuizzes = snapshotToArray(quizzesSnapshot);

    modules = await Promise.all(modules.map(async (mod) => {
      const categoryModules = allCategoryModules
        .filter(cm => cm.moduleId === mod.id)
        .sort((a, b) => a.position - b.position)
        .map(cm => ({ ...cm, category: categoriesMap[cm.categoryId] || null }));

      const quizzes = allQuizzes
        .filter(q => q.moduleId === mod.id)
        .map(q => ({ id: q.id, title: q.title, isActive: q.isActive }));

      let objectives = undefined;
      if (includeObjectives === 'true') {
        const objSnap = await db.collection(COLLECTIONS.MODULE_OBJECTIVES)
          .where('moduleId', '==', mod.id).orderBy('position', 'asc').get();
        objectives = snapshotToArray(objSnap);
      }

      let slides = undefined;
      if (includeSlides === 'true') {
        const slideSnap = await db.collection(COLLECTIONS.MODULE_SLIDES)
          .where('moduleId', '==', mod.id).orderBy('position', 'asc').get();
        slides = snapshotToArray(slideSnap);
      }

      return { ...mod, categoryModules, quizzes, ...(objectives !== undefined && { objectives }), ...(slides !== undefined && { slides }) };
    }));

    res.status(200).json({ success: true, count: modules.length, data: modules });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch modules', message: error.message });
  }
}
