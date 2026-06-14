import { getDb, COLLECTIONS, docToObject, updateDoc } from '../../db/firestore.js';
import { deleteFile } from '../../utils/storage.js';

export default async function deleteQuestionImage(req, res) {
  try {
    const { questionId } = req.params;
    const db = getDb();

    const qDoc = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).get();
    const question = docToObject(qDoc);
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });
    if (!question.imagePath) return res.status(400).json({ success: false, error: 'Question has no image' });

    try { await deleteFile(question.imagePath); } catch (e) { console.error('Failed to delete cloud image:', e); }

    await updateDoc(COLLECTIONS.QUIZ_QUESTIONS, questionId, { imageUrl: null, imagePath: null, imageMime: null });
    const updated = docToObject(await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).get());

    res.status(200).json({ success: true, message: 'Image deleted successfully', data: updated });
  } catch (error) {
    console.error('Error deleting quiz question image:', error);
    res.status(500).json({ success: false, error: 'Failed to delete image', message: error.message });
  }
}
