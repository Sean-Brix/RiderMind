import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';

export default async function updateOption(req, res) {
  try {
    const { optionId } = req.params;
    const { optionText, isCorrect, position, imageUrl, imagePath, imageMime } = req.body;
    const { questionId } = req.query;
    const db = getDb();

    if (!questionId) return res.status(400).json({ success: false, error: 'questionId query param is required' });

    const qDoc = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).get();
    const question = docToObject(qDoc);
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });

    const options = question.options || [];
    const optIndex = options.findIndex(o => o.id === optionId);
    if (optIndex === -1) return res.status(404).json({ success: false, error: 'Option not found' });

    const updatedOption = { ...options[optIndex] };
    if (optionText !== undefined) updatedOption.optionText = optionText;
    if (isCorrect !== undefined) updatedOption.isCorrect = isCorrect;
    if (position !== undefined) updatedOption.position = position;
    if (imageUrl !== undefined) updatedOption.imageUrl = imageUrl;
    if (imagePath !== undefined) updatedOption.imagePath = imagePath;
    if (imageMime !== undefined) updatedOption.imageMime = imageMime;

    const newOptions = [...options];
    newOptions[optIndex] = updatedOption;

    await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).update({
      options: newOptions, updatedAt: new Date().toISOString(),
    });

    res.status(200).json({ success: true, message: 'Option updated successfully', data: updatedOption });
  } catch (error) {
    console.error('Error updating option:', error);
    res.status(500).json({ success: false, error: 'Failed to update option', message: error.message });
  }
}
