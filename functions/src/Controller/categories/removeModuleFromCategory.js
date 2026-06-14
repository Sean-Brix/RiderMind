import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function removeModuleFromCategory(req, res) {
  try {
    const { id, moduleId } = req.params;
    const db = getDb();

    const assignSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES)
      .where('categoryId', '==', id).where('moduleId', '==', moduleId).get();
    if (assignSnap.empty) return res.status(404).json({ success: false, error: 'Module not assigned to this category' });

    await assignSnap.docs[0].ref.delete();

    const remainingSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).where('categoryId', '==', id).orderBy('position', 'asc').get();
    const batch = db.batch();
    const ts = new Date().toISOString();
    remainingSnap.docs.forEach((d, i) => batch.update(d.ref, { position: i, updatedAt: ts }));
    await batch.commit();

    const catDoc = await db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(id).get();
    const catModSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).where('categoryId', '==', id).orderBy('position', 'asc').get();
    const catMods = snapshotToArray(catModSnap);
    const modSnap = await db.collection(COLLECTIONS.MODULES).get();
    const modMap = {};
    modSnap.docs.forEach(d => { modMap[d.id] = { id: d.id, ...d.data() }; });

    const modules = catMods.map(cm => ({ ...cm, module: modMap[cm.moduleId] || null }));
    res.status(200).json({ success: true, message: 'Module removed successfully', data: { ...docToObject(catDoc), modules } });
  } catch (error) {
    console.error('Error removing module:', error);
    res.status(500).json({ success: false, error: 'Failed to remove module', message: error.message });
  }
}
