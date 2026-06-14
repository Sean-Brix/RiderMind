import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function reorderObjectives(req, res) {
  try {
    const { moduleId } = req.params;
    const { objectives } = req.body;

    if (!objectives || !Array.isArray(objectives)) {
      return res.status(400).json({ success: false, error: 'Objectives array is required' });
    }

    const db = getDb();
    const modDoc = await db.collection(COLLECTIONS.MODULES).doc(moduleId).get();
    if (!docToObject(modDoc)) return res.status(404).json({ success: false, error: 'Module not found' });

    const batch = db.batch();
    const ts = new Date().toISOString();
    objectives.forEach(({ id, position }) => {
      batch.update(db.collection(COLLECTIONS.MODULE_OBJECTIVES).doc(id), { position, updatedAt: ts });
    });
    await batch.commit();

    const updatedSnap = await db.collection(COLLECTIONS.MODULE_OBJECTIVES).where('moduleId', '==', moduleId).orderBy('position', 'asc').get();
    res.status(200).json({ success: true, data: snapshotToArray(updatedSnap) });
  } catch (error) {
    console.error('Error reordering objectives:', error);
    res.status(500).json({ success: false, error: 'Failed to reorder objectives', message: error.message });
  }
}
