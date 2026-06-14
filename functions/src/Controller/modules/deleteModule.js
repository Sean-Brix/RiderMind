import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';
import { deleteVideoFile } from '../../utils/videoHandler.js';

export default async function deleteModule(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();

    const doc = await db.collection(COLLECTIONS.MODULES).doc(id).get();
    const mod = docToObject(doc);
    if (!mod) return res.status(404).json({ success: false, error: 'Module not found' });

    // Check category assignments
    const categoryModulesSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).where('moduleId', '==', id).get();
    if (!categoryModulesSnap.empty) {
      const categoriesSnap = await db.collection(COLLECTIONS.MODULE_CATEGORIES).get();
      const catMap = {};
      categoriesSnap.docs.forEach(d => { catMap[d.id] = d.data().name; });
      const names = categoryModulesSnap.docs.map(d => catMap[d.data().categoryId] || 'Unknown').join(', ');
      return res.status(400).json({ success: false, error: 'Cannot delete module assigned to categories', message: `Module is in: ${names}` });
    }

    // Delete cloud videos
    const slidesSnap = await db.collection(COLLECTIONS.MODULE_SLIDES).where('moduleId', '==', id).get();
    for (const slideDoc of slidesSnap.docs) {
      const slide = slideDoc.data();
      if (slide.videoPath) {
        try { await deleteVideoFile(slide.videoPath); } catch (e) { console.error('Failed to delete video:', e); }
      }
    }

    // Batch delete related docs
    const batch = db.batch();
    const objSnap = await db.collection(COLLECTIONS.MODULE_OBJECTIVES).where('moduleId', '==', id).get();
    objSnap.docs.forEach(d => batch.delete(d.ref));
    slidesSnap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(db.collection(COLLECTIONS.MODULES).doc(id));
    await batch.commit();

    res.status(200).json({ success: true, message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ success: false, error: 'Failed to delete module', message: error.message });
  }
}
