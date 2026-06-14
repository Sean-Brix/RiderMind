import { getDb, COLLECTIONS, docToObject, createDoc } from '../../db/firestore.js';

export default async function addSlide(req, res) {
  try {
    const { moduleId } = req.params;
    const { type, title, content, description, position, skillLevel, videoPath } = req.body;

    if (!type || !['text', 'image', 'video'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Valid slide type is required (text, image, or video)' });
    }

    const db = getDb();
    const modDoc = await db.collection(COLLECTIONS.MODULES).doc(moduleId).get();
    if (!docToObject(modDoc)) return res.status(404).json({ success: false, error: 'Module not found' });

    const slide = await createDoc(COLLECTIONS.MODULE_SLIDES, {
      moduleId, type, title: title || '', content: content || '',
      description: description || null, position: position || 0,
      skillLevel: skillLevel || 'Beginner', videoPath: videoPath || null,
      imageUrl: null, imagePath: null, imageMime: null, videoUrl: null,
    });

    res.status(201).json({ success: true, message: 'Slide added successfully. Upload image via POST /slides/:slideId/image if needed.', data: slide });
  } catch (error) {
    console.error('Error adding slide:', error);
    res.status(500).json({ success: false, error: 'Failed to add slide', message: error.message });
  }
}
