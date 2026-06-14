import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';

export default async function streamSlideVideo(req, res) {
  try {
    const { slideId } = req.params;
    const db = getDb();

    const slideDoc = await db.collection(COLLECTIONS.MODULE_SLIDES).doc(slideId).get();
    const slide = docToObject(slideDoc);
    if (!slide) return res.status(404).json({ success: false, error: 'Slide not found' });

    if (slide.type !== 'video' || !slide.videoPath) {
      return res.status(404).json({ success: false, error: 'No video available for this slide' });
    }

    if (!slide.videoUrl) return res.status(404).json({ success: false, error: 'Video URL not available' });

    return res.redirect(slide.videoUrl);
  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(500).json({ success: false, error: 'Failed to stream video', message: error.message });
  }
}
