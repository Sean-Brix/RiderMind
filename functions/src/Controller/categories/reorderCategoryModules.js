import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function reorderCategoryModules(req, res) {
  try {
    const { id } = req.params;
    const { modules } = req.body;
    const db = getDb();

    if (!Array.isArray(modules)) return res.status(400).json({ success: false, error: 'modules must be an array' });

    const catDoc = await db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(id).get();
    if (!docToObject(catDoc)) return res.status(404).json({ success: false, error: 'Category not found' });

    const batch = db.batch();
    const ts = new Date().toISOString();

    await Promise.all(modules.map(async ({ moduleId, position }) => {
      const snap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES)
        .where('categoryId', '==', id).where('moduleId', '==', moduleId).get();
      snap.docs.forEach(d => batch.update(d.ref, { position, updatedAt: ts }));
    }));

    await batch.commit();

    const catModSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).where('categoryId', '==', id).orderBy('position', 'asc').get();
    const catMods = snapshotToArray(catModSnap);
    const modSnap = await db.collection(COLLECTIONS.MODULES).get();
    const modMap = {};
    modSnap.docs.forEach(d => { modMap[d.id] = { id: d.id, ...d.data() }; });
    const mods = catMods.map(cm => ({ ...cm, module: modMap[cm.moduleId] ? { id: modMap[cm.moduleId].id, title: modMap[cm.moduleId].title, description: modMap[cm.moduleId].description, isActive: modMap[cm.moduleId].isActive, position: modMap[cm.moduleId].position } : null }));

    const category = docToObject(await db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(id).get());
    res.status(200).json({ success: true, message: 'Modules reordered successfully', data: { ...category, modules: mods } });
  } catch (error) {
    console.error('Error reordering modules:', error);
    res.status(500).json({ success: false, error: 'Failed to reorder modules', message: error.message });
  }
}
