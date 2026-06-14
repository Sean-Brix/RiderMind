import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function reorderSlides(req, res) {
  try {
    const { moduleId } = req.params;
    const { slides } = req.body;

    if (!slides || !Array.isArray(slides)) {
      return res.status(400).json({ success: false, error: 'Slides array is required' });
    }

    const db = getDb();
    const modDoc = await db.collection(COLLECTIONS.MODULES).doc(moduleId).get();
    if (!docToObject(modDoc)) return res.status(404).json({ success: false, error: 'Module not found' });

    const batch = db.batch();
    const ts = new Date().toISOString();
    slides.forEach(({ id, position }) => {
      batch.update(db.collection(COLLECTIONS.MODULE_SLIDES).doc(id), { position, updatedAt: ts });
    });
    await batch.commit();

    const updatedSnap = await db.collection(COLLECTIONS.MODULE_SLIDES).where('moduleId', '==', moduleId).orderBy('position', 'asc').get();
    res.status(200).json({ success: true, data: snapshotToArray(updatedSnap) });
  } catch (error) {
    console.error('Error reordering slides:', error);
    res.status(500).json({ success: false, error: 'Failed to reorder slides', message: error.message });
  }
}
