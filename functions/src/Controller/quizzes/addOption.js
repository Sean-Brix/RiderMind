import { v4 as uuidv4 } from 'uuid';
import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';

export default async function addOption(req, res) {
  try {
    const { questionId } = req.params;
    const { optionText, isCorrect, position, imageUrl, imagePath, imageMime } = req.body;
    const db = getDb();

    if (!optionText) return res.status(400).json({ success: false, error: 'Option text is required' });

    const qDoc = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).get();
    const question = docToObject(qDoc);
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });

    const currentOptions = question.options || [];
    const newOption = {
      id: uuidv4(), optionText, isCorrect: isCorrect || false,
      position: position || currentOptions.length + 1,
      imageUrl: imageUrl || null, imagePath: imagePath || null, imageMime: imageMime || null,
    };

    await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).update({
      options: [...currentOptions, newOption], updatedAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, message: 'Option added successfully', data: newOption });
  } catch (error) {
    console.error('Error adding option:', error);
    res.status(500).json({ success: false, error: 'Failed to add option', message: error.message });
  }
}
