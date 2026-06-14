import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function bulkAddModulesToCategory(req, res) {
  try {
    const { id } = req.params;
    const { moduleIds } = req.body;
    const db = getDb();

    if (!moduleIds || !Array.isArray(moduleIds) || moduleIds.length === 0) {
      return res.status(400).json({ error: 'moduleIds array is required and must not be empty' });
    }

    const catDoc = await db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(id).get();
    if (!docToObject(catDoc)) return res.status(404).json({ error: 'Category not found' });

    // Check modules exist
    const modDocs = await Promise.all(moduleIds.map(mid => db.collection(COLLECTIONS.MODULES).doc(mid).get()));
    if (modDocs.some(d => !d.exists)) return res.status(400).json({ error: 'One or more modules not found' });

    const existingSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).where('categoryId', '==', id).get();
    const assignedModuleIds = new Set(existingSnap.docs.map(d => d.data().moduleId));

    const newModuleIds = moduleIds.filter(mid => !assignedModuleIds.has(mid));
    if (newModuleIds.length === 0) {
      const catMods = snapshotToArray(existingSnap);
      return res.status(200).json({ message: 'All modules are already assigned to this category', category: { ...docToObject(catDoc), moduleCount: catMods.length } });
    }

    const maxPosition = existingSnap.empty ? -1 : Math.max(...existingSnap.docs.map(d => d.data().position));
    const ts = new Date().toISOString();
    const batch = db.batch();
    newModuleIds.forEach((mid, index) => {
      const ref = db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).doc();
      batch.set(ref, { categoryId: id, moduleId: mid, position: maxPosition + 1 + index, createdAt: ts, updatedAt: ts });
    });
    await batch.commit();

    const updatedSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).where('categoryId', '==', id).orderBy('position', 'asc').get();
    const catMods = snapshotToArray(updatedSnap);
    const modSnap = await db.collection(COLLECTIONS.MODULES).get();
    const modMap = {};
    modSnap.docs.forEach(d => { modMap[d.id] = { id: d.id, ...d.data() }; });
    const modules = catMods.map(cm => ({ ...cm, module: modMap[cm.moduleId] || null }));

    res.status(200).json({ message: `${newModuleIds.length} module(s) added successfully`, category: { ...docToObject(catDoc), modules, moduleCount: modules.length } });
  } catch (error) {
    console.error('Error bulk adding modules to category:', error);
    res.status(500).json({ error: 'Failed to bulk add modules to category', details: error.message });
  }
}
