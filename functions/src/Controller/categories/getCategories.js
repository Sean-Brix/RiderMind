import { getDb, COLLECTIONS, snapshotToArray } from '../../db/firestore.js';

export default async function getCategories(req, res) {
  try {
    const { isActive } = req.query;
    const db = getDb();

    let query = db.collection(COLLECTIONS.MODULE_CATEGORIES);
    if (isActive !== undefined) query = query.where('isActive', '==', isActive === 'true');

    const catSnap = await query.get();
    const categories = snapshotToArray(catSnap);

    const catModSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).get();
    const allCatMods = snapshotToArray(catModSnap);

    const modSnap = await db.collection(COLLECTIONS.MODULES).get();
    const modMap = {};
    modSnap.docs.forEach(d => { modMap[d.id] = { id: d.id, ...d.data() }; });

    const result = categories
      .map(cat => {
        const modules = allCatMods
          .filter(cm => cm.categoryId === cat.id)
          .sort((a, b) => a.position - b.position)
          .map(cm => ({ ...cm, module: modMap[cm.moduleId] ? { id: modMap[cm.moduleId].id, title: modMap[cm.moduleId].title, description: modMap[cm.moduleId].description, isActive: modMap[cm.moduleId].isActive } : null }));
        return { ...cat, modules, moduleCount: modules.length };
      })
      .sort((a, b) => {
        if (b.isDefault !== a.isDefault) return b.isDefault ? 1 : -1;
        return (a.name || '').localeCompare(b.name || '');
      });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch categories', message: error.message });
  }
}
