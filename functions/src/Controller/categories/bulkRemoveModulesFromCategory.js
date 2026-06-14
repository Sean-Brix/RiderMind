import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function bulkRemoveModulesFromCategory(req, res) {
  try {
    const { id } = req.params;
    const { moduleIds } = req.body;
    const db = getDb();

    if (!moduleIds || !Array.isArray(moduleIds) || moduleIds.length === 0) {
      return res.status(400).json({ error: 'moduleIds array is required and must not be empty' });
    }

    const catDoc = await db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(id).get();
    if (!docToObject(catDoc)) return res.status(404).json({ error: 'Category not found' });

    const toDeleteSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES)
      .where('categoryId', '==', id).get();
    const toDelete = toDeleteSnap.docs.filter(d => moduleIds.includes(d.data().moduleId));

    const batch = db.batch();
    toDelete.forEach(d => batch.delete(d.ref));
    await batch.commit();

    const remainingSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).where('categoryId', '==', id).orderBy('position', 'asc').get();
    const reorderBatch = db.batch();
    const ts = new Date().toISOString();
    remainingSnap.docs.forEach((d, i) => reorderBatch.update(d.ref, { position: i, updatedAt: ts }));
    await reorderBatch.commit();

    const updatedSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).where('categoryId', '==', id).orderBy('position', 'asc').get();
    const catMods = snapshotToArray(updatedSnap);
    const modSnap = await db.collection(COLLECTIONS.MODULES).get();
    const modMap = {};
    modSnap.docs.forEach(d => { modMap[d.id] = { id: d.id, ...d.data() }; });
    const modules = catMods.map(cm => ({ ...cm, module: modMap[cm.moduleId] || null }));

    res.status(200).json({ message: `${toDelete.length} module(s) removed successfully`, category: { ...docToObject(catDoc), modules, moduleCount: modules.length } });
  } catch (error) {
    console.error('Error bulk removing modules from category:', error);
    res.status(500).json({ error: 'Failed to bulk remove modules from category', details: error.message });
  }
}
