import { getDb, COLLECTIONS, docToObject, updateDoc } from '../../db/firestore.js';
import { deleteFile } from '../../utils/storage.js';

export default async function deleteQuestionVideo(req, res) {
  try {
    const { questionId } = req.params;
    const db = getDb();

    const qDoc = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).get();
    const question = docToObject(qDoc);
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });
    if (!question.videoPath) return res.status(400).json({ success: false, error: 'Question has no video' });

    try { await deleteFile(question.videoPath); } catch (e) { console.error('Failed to delete cloud video:', e); }

    await updateDoc(COLLECTIONS.QUIZ_QUESTIONS, questionId, { videoUrl: null, videoPath: null });
    const updated = docToObject(await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).get());

    res.status(200).json({ success: true, message: 'Video deleted successfully', data: updated });
  } catch (error) {
    console.error('Error deleting quiz question video:', error);
    res.status(500).json({ success: false, error: 'Failed to delete video', message: error.message });
  }
}
