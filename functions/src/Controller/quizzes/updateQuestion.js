import { getDb, COLLECTIONS, docToObject, updateDoc } from '../../db/firestore.js';

export default async function updateQuestion(req, res) {
  try {
    const { questionId } = req.params;
    const { type, question, points, position, explanation, caseSensitive, shuffleOptions,
      imageUrl, imagePath, imageMime, videoUrl, videoPath } = req.body;
    const db = getDb();

    const qDoc = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).get();
    if (!docToObject(qDoc)) return res.status(404).json({ success: false, error: 'Question not found' });

    const data = {};
    if (type !== undefined) data.type = type;
    if (question !== undefined) data.question = question;
    if (points !== undefined) data.points = points;
    if (position !== undefined) data.position = position;
    if (explanation !== undefined) data.explanation = explanation;
    if (caseSensitive !== undefined) data.caseSensitive = caseSensitive;
    if (shuffleOptions !== undefined) data.shuffleOptions = shuffleOptions;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (imagePath !== undefined) data.imagePath = imagePath;
    if (imageMime !== undefined) data.imageMime = imageMime;
    if (videoUrl !== undefined) data.videoUrl = videoUrl;
    if (videoPath !== undefined) data.videoPath = videoPath;

    await updateDoc(COLLECTIONS.QUIZ_QUESTIONS, questionId, data);
    const updated = docToObject(await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).get());

    res.status(200).json({ success: true, message: 'Question updated successfully', data: updated });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ success: false, error: 'Failed to update question', message: error.message });
  }
}
