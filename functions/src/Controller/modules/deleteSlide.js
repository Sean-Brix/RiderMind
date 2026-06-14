import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';
import { deleteVideoFile } from '../../utils/videoHandler.js';

export default async function deleteSlide(req, res) {
  try {
    const { slideId } = req.params;
    const db = getDb();

    const existDoc = await db.collection(COLLECTIONS.MODULE_SLIDES).doc(slideId).get();
    const existing = docToObject(existDoc);
    if (!existing) return res.status(404).json({ success: false, error: 'Slide not found' });

    if (existing.type === 'video' && existing.videoPath) {
      try { await deleteVideoFile(existing.videoPath); } catch (e) { console.error('Failed to delete video:', e); }
    }

    await db.collection(COLLECTIONS.MODULE_SLIDES).doc(slideId).delete();
    res.status(200).json({ success: true, message: 'Slide deleted successfully' });
  } catch (error) {
    console.error('Error deleting slide:', error);
    res.status(500).json({ success: false, error: 'Failed to delete slide', message: error.message });
  }
}
