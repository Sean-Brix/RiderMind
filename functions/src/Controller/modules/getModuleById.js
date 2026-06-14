import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function getModuleById(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();

    const doc = await db.collection(COLLECTIONS.MODULES).doc(id).get();
    const mod = docToObject(doc);
    if (!mod) return res.status(404).json({ success: false, error: 'Module not found' });

    const [objSnap, slideSnap] = await Promise.all([
      db.collection(COLLECTIONS.MODULE_OBJECTIVES).where('moduleId', '==', id).orderBy('position', 'asc').get(),
      db.collection(COLLECTIONS.MODULE_SLIDES).where('moduleId', '==', id).orderBy('position', 'asc').get(),
    ]);

    res.status(200).json({
      success: true,
      data: { ...mod, objectives: snapshotToArray(objSnap), slides: snapshotToArray(slideSnap) }
    });
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch module', message: error.message });
  }
}
