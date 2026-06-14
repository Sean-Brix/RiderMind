import { getDb, COLLECTIONS, docToObject, updateDoc } from '../../db/firestore.js';
import { uploadFile, deleteFile, generateUniqueFilename } from '../../utils/storage.js';

export default async function uploadSlideVideo(req, res) {
  try {
    const { slideId } = req.params;
    const db = getDb();

    const slideDoc = await db.collection(COLLECTIONS.MODULE_SLIDES).doc(slideId).get();
    const slide = docToObject(slideDoc);
    if (!slide) return res.status(404).json({ success: false, error: 'Slide not found' });

    if (!req.file) return res.status(400).json({ success: false, error: 'No video file uploaded' });

    if (slide.videoPath) {
      try { await deleteFile(slide.videoPath); } catch (e) { console.error('Failed to delete old video:', e); }
    }

    const filename = generateUniqueFilename(req.file.originalname);
    const storagePath = `modules/${slide.moduleId || 'unknown'}/slides/${slideId}/${filename}`;
    const result = await uploadFile(req.file.buffer, storagePath, req.file.mimetype);

    await updateDoc(COLLECTIONS.MODULE_SLIDES, slideId, { type: 'video', videoUrl: result.url, videoPath: result.path });

    const updated = docToObject(await db.collection(COLLECTIONS.MODULE_SLIDES).doc(slideId).get());
    res.status(200).json({
      success: true, message: 'Video uploaded successfully', data: updated,
      file: { size: req.file.size, mimetype: req.file.mimetype },
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ success: false, error: 'Failed to upload video', message: error.message });
  }
}
