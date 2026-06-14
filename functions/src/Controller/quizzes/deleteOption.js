import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';

export default async function deleteOption(req, res) {
  try {
    const { optionId } = req.params;
    const { questionId } = req.query;
    const db = getDb();

    if (!questionId) return res.status(400).json({ success: false, error: 'questionId query param is required' });

    const qDoc = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).get();
    const question = docToObject(qDoc);
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });

    const options = question.options || [];
    const exists = options.some(o => o.id === optionId);
    if (!exists) return res.status(404).json({ success: false, error: 'Option not found' });

    await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).update({
      options: options.filter(o => o.id !== optionId), updatedAt: new Date().toISOString(),
    });

    res.status(200).json({ success: true, message: 'Option deleted successfully', data: { id: optionId } });
  } catch (error) {
    console.error('Error deleting option:', error);
    res.status(500).json({ success: false, error: 'Failed to delete option', message: error.message });
  }
}
