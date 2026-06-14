import { getDb, COLLECTIONS, docToObject, updateDoc } from '../../db/firestore.js';
import { uploadFile, deleteFile, generateUniqueFilename } from '../../utils/storage.js';
import { uploadQuizImage } from '../../utils/quizMediaHandler.js';

export default async function uploadQuestionImage(req, res) {
  try {
    const { questionId } = req.params;
    const db = getDb();

    const qDoc = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).get();
    const question = docToObject(qDoc);
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });

    if (!req.file) return res.status(400).json({ success: false, error: 'No image file provided' });

    if (question.imagePath) {
      try { await deleteFile(question.imagePath); } catch (e) { console.warn('Could not delete old image:', e.message); }
    }

    const quizDoc = await db.collection(COLLECTIONS.QUIZZES).doc(question.quizId).get();
    const quizId = question.quizId || 'unknown';

    const filename = generateUniqueFilename(req.file.originalname);
    const storagePath = `quizzes/${quizId}/questions/${questionId}/${filename}`;
    const uploadResult = await uploadFile(req.file.buffer, storagePath, req.file.mimetype);

    await updateDoc(COLLECTIONS.QUIZ_QUESTIONS, questionId, {
      imageUrl: uploadResult.url, imagePath: storagePath, imageMime: req.file.mimetype,
    });

    const updated = docToObject(await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).get());
    res.status(200).json({ success: true, message: 'Image uploaded successfully', data: { id: updated.id, imageUrl: updated.imageUrl, imagePath: updated.imagePath, imageMime: updated.imageMime, question: updated } });
  } catch (error) {
    console.error('Error uploading quiz question image:', error);
    res.status(500).json({ success: false, error: 'Failed to upload image', message: error.message });
  }
}

export { uploadQuizImage };
