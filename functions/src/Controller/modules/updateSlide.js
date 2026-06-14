import { getDb, COLLECTIONS, docToObject, updateDoc } from '../../db/firestore.js';
import { deleteVideoFile } from '../../utils/videoHandler.js';

export default async function updateSlide(req, res) {
  try {
    const { slideId } = req.params;
    const { type, title, content, description, position, skillLevel, videoPath } = req.body;
    const db = getDb();

    const existDoc = await db.collection(COLLECTIONS.MODULE_SLIDES).doc(slideId).get();
    const existing = docToObject(existDoc);
    if (!existing) return res.status(404).json({ success: false, error: 'Slide not found' });

    const data = {};
    if (type !== undefined) data.type = type;
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (description !== undefined) data.description = description;
    if (position !== undefined) data.position = position;
    if (skillLevel !== undefined) data.skillLevel = skillLevel;

    if (videoPath !== undefined) {
      if (existing.videoPath && existing.videoPath !== videoPath) {
        try { await deleteVideoFile(existing.videoPath); } catch (e) { console.error('Failed to delete old video:', e); }
      }
      data.videoPath = videoPath;
    }

    await updateDoc(COLLECTIONS.MODULE_SLIDES, slideId, data);
    const updated = docToObject(await db.collection(COLLECTIONS.MODULE_SLIDES).doc(slideId).get());

    res.status(200).json({ success: true, message: 'Slide updated successfully', data: updated });
  } catch (error) {
    console.error('Error updating slide:', error);
    res.status(500).json({ success: false, error: 'Failed to update slide', message: error.message });
  }
}
