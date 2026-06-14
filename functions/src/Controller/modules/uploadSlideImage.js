import { getDb, COLLECTIONS, docToObject, updateDoc } from '../../db/firestore.js';
import { validateImage } from '../../utils/imageHandler.js';
import { uploadFile, deleteFile, generateUniqueFilename } from '../../utils/storage.js';

export default async function uploadSlideImage(req, res) {
  try {
    const { slideId } = req.params;

    if (!req.file) return res.status(400).json({ success: false, error: 'No image file uploaded' });

    try { validateImage(req.file); } catch (e) { return res.status(400).json({ success: false, error: e.message }); }

    const db = getDb();
    const slideDoc = await db.collection(COLLECTIONS.MODULE_SLIDES).doc(slideId).get();
    const slide = docToObject(slideDoc);
    if (!slide) return res.status(404).json({ success: false, error: 'Slide not found' });

    const filename = generateUniqueFilename(req.file.originalname);
    const storagePath = `modules/${slide.moduleId || 'unknown'}/slides/${slideId}/${filename}`;

    if (slide.imagePath) {
      try { await deleteFile(slide.imagePath); } catch (e) { console.error('Failed to delete old image:', e); }
    }

    const result = await uploadFile(req.file.buffer, storagePath, req.file.mimetype);

    await updateDoc(COLLECTIONS.MODULE_SLIDES, slideId, {
      imageUrl: result.url, imagePath: result.path, imageMime: req.file.mimetype, type: 'image',
    });

    const updated = docToObject(await db.collection(COLLECTIONS.MODULE_SLIDES).doc(slideId).get());
    res.status(200).json({ success: true, message: 'Image uploaded successfully', data: updated });
  } catch (error) {
    console.error('Error uploading slide image:', error);
    res.status(500).json({ success: false, error: 'Failed to upload image', message: error.message });
  }
}
