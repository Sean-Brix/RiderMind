import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';

export default async function getSlideImage(req, res) {
  try {
    const { slideId } = req.params;
    const db = getDb();

    const slideDoc = await db.collection(COLLECTIONS.MODULE_SLIDES).doc(slideId).get();
    const slide = docToObject(slideDoc);
    if (!slide) return res.status(404).json({ success: false, error: 'Slide not found' });

    if (slide.type !== 'image' || !slide.imagePath) {
      return res.status(404).json({ success: false, error: 'No image available for this slide' });
    }

    if (!slide.imageUrl) return res.status(404).json({ success: false, error: 'Image URL not available' });

    return res.redirect(slide.imageUrl);
  } catch (error) {
    console.error('Error fetching slide image:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch slide image', message: error.message });
  }
}
