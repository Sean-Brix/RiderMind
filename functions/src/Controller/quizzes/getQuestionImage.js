import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';

export default async function getQuestionImage(req, res) {
  try {
    const { questionId } = req.params;
    const db = getDb();

    const qDoc = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).get();
    const question = docToObject(qDoc);
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });
    if (!question.imagePath) return res.status(404).json({ success: false, error: 'Question has no image' });
    if (!question.imageUrl) return res.status(404).json({ success: false, error: 'Image URL not available' });

    return res.redirect(question.imageUrl);
  } catch (error) {
    console.error('Error getting quiz question image:', error);
    res.status(500).json({ success: false, error: 'Failed to get image', message: error.message });
  }
}
