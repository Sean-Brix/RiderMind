import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function getCategoryById(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();

    const catDoc = await db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(id).get();
    const category = docToObject(catDoc);
    if (!category) return res.status(404).json({ success: false, error: 'Category not found' });

    const catModSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).where('categoryId', '==', id).orderBy('position', 'asc').get();
    const catMods = snapshotToArray(catModSnap);

    const modules = await Promise.all(catMods.map(async (cm) => {
      const modDoc = await db.collection(COLLECTIONS.MODULES).doc(cm.moduleId).get();
      const mod = docToObject(modDoc);
      if (!mod) return { ...cm, module: null };

      const [objSnap, slideSnap, quizSnap] = await Promise.all([
        db.collection(COLLECTIONS.MODULE_OBJECTIVES).where('moduleId', '==', cm.moduleId).orderBy('position', 'asc').get(),
        db.collection(COLLECTIONS.MODULE_SLIDES).where('moduleId', '==', cm.moduleId).orderBy('position', 'asc').get(),
        db.collection(COLLECTIONS.QUIZZES).where('moduleId', '==', cm.moduleId).get(),
      ]);

      return {
        ...cm,
        module: {
          ...mod,
          objectives: snapshotToArray(objSnap),
          slides: snapshotToArray(slideSnap),
          quizzes: snapshotToArray(quizSnap).map(q => ({ id: q.id, title: q.title, isActive: q.isActive })),
        }
      };
    }));

    res.status(200).json({ success: true, data: { ...category, modules } });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch category', message: error.message });
  }
}
