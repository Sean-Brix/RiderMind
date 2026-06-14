import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function assignModulesToCategory(req, res) {
  try {
    const { id } = req.params;
    const { moduleIds } = req.body;
    const db = getDb();

    if (!Array.isArray(moduleIds)) return res.status(400).json({ success: false, error: 'moduleIds must be an array' });

    const catDoc = await db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(id).get();
    if (!docToObject(catDoc)) return res.status(404).json({ success: false, error: 'Category not found' });

    if (moduleIds.length > 0) {
      const modDocs = await Promise.all(moduleIds.map(mid => db.collection(COLLECTIONS.MODULES).doc(mid).get()));
      if (modDocs.some(d => !d.exists)) return res.status(400).json({ success: false, error: 'One or more modules not found' });
    }

    const existSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).where('categoryId', '==', id).get();
    const batch = db.batch();
    existSnap.docs.forEach(d => batch.delete(d.ref));

    const ts = new Date().toISOString();
    moduleIds.forEach((mid, index) => {
      const ref = db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).doc();
      batch.set(ref, { categoryId: id, moduleId: mid, position: index, createdAt: ts, updatedAt: ts });
    });
    await batch.commit();

    const updatedSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).where('categoryId', '==', id).orderBy('position', 'asc').get();
    const catMods = snapshotToArray(updatedSnap);
    const modSnap = await db.collection(COLLECTIONS.MODULES).get();
    const modMap = {};
    modSnap.docs.forEach(d => { modMap[d.id] = { id: d.id, ...d.data() }; });
    const modules = catMods.map(cm => ({ ...cm, module: modMap[cm.moduleId] ? { id: modMap[cm.moduleId].id, title: modMap[cm.moduleId].title, description: modMap[cm.moduleId].description, isActive: modMap[cm.moduleId].isActive } : null }));

    const category = docToObject(await db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(id).get());
    res.status(200).json({ success: true, message: 'Modules assigned successfully', data: { ...category, modules } });
  } catch (error) {
    console.error('Error assigning modules:', error);
    res.status(500).json({ success: false, error: 'Failed to assign modules', message: error.message });
  }
}
