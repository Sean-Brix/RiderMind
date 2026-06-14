import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function addModuleToCategory(req, res) {
  try {
    const { id } = req.params;
    const { moduleId } = req.body;

    if (!moduleId) return res.status(400).json({ success: false, error: 'moduleId is required' });

    const db = getDb();
    const [catDoc, modDoc] = await Promise.all([
      db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(id).get(),
      db.collection(COLLECTIONS.MODULES).doc(moduleId).get(),
    ]);

    if (!docToObject(catDoc)) return res.status(404).json({ success: false, error: 'Category not found' });
    if (!docToObject(modDoc)) return res.status(404).json({ success: false, error: 'Module not found' });

    const existSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES)
      .where('categoryId', '==', id).where('moduleId', '==', moduleId).get();
    if (!existSnap.empty) return res.status(400).json({ success: false, error: 'Module already assigned to this category' });

    const maxSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES)
      .where('categoryId', '==', id).orderBy('position', 'desc').limit(1).get();
    const newPosition = maxSnap.empty ? 0 : maxSnap.docs[0].data().position + 1;

    const ts = new Date().toISOString();
    await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).add({ categoryId: id, moduleId, position: newPosition, createdAt: ts, updatedAt: ts });

    const catModSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).where('categoryId', '==', id).orderBy('position', 'asc').get();
    const catMods = snapshotToArray(catModSnap);
    const modSnap = await db.collection(COLLECTIONS.MODULES).get();
    const modMap = {};
    modSnap.docs.forEach(d => { modMap[d.id] = { id: d.id, ...d.data() }; });

    const modules = catMods.map(cm => ({ ...cm, module: modMap[cm.moduleId] || null }));
    const category = docToObject(catDoc);

    res.status(200).json({ success: true, message: 'Module added successfully', data: { ...category, modules } });
  } catch (error) {
    console.error('Error adding module:', error);
    res.status(500).json({ success: false, error: 'Failed to add module', message: error.message });
  }
}
