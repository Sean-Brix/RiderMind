import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';

export default async function deleteQuestion(req, res) {
  try {
    const { questionId } = req.params;
    const db = getDb();

    const qDoc = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).get();
    if (!docToObject(qDoc)) return res.status(404).json({ success: false, error: 'Question not found' });

    await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).delete();
    res.status(200).json({ success: true, message: 'Question deleted successfully', data: { id: questionId } });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ success: false, error: 'Failed to delete question', message: error.message });
  }
}
