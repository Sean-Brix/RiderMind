import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';

export default async function streamQuestionVideo(req, res) {
  try {
    const { questionId } = req.params;
    const db = getDb();

    const qDoc = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).get();
    const question = docToObject(qDoc);
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });
    if (!question.videoPath) return res.status(404).json({ success: false, error: 'Question has no video' });
    if (!question.videoUrl) return res.status(404).json({ success: false, error: 'Video URL not available' });

    return res.redirect(question.videoUrl);
  } catch (error) {
    console.error('Error streaming quiz question video:', error);
    res.status(500).json({ success: false, error: 'Failed to stream video', message: error.message });
  }
}
