import { getDb, COLLECTIONS, docToObject, updateDoc } from '../../db/firestore.js';
import { uploadFile, deleteFile, generateUniqueFilename } from '../../utils/storage.js';
import { uploadQuizVideo } from '../../utils/quizMediaHandler.js';

export default async function uploadQuestionVideo(req, res) {
  try {
    const { questionId } = req.params;
    const db = getDb();

    const qDoc = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).get();
    const question = docToObject(qDoc);
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });

    if (!req.file) return res.status(400).json({ success: false, error: 'No video file provided' });

    if (question.videoPath) {
      try { await deleteFile(question.videoPath); } catch (e) { console.error('Failed to delete old video:', e); }
    }

    const timestamp = Date.now();
    const filename = generateUniqueFilename(req.file.originalname);
    const storagePath = `quizzes/${question.quizId}/questions/${questionId}/${timestamp}-${filename}`;
    const uploadResult = await uploadFile(req.file.buffer, storagePath, req.file.mimetype);

    await updateDoc(COLLECTIONS.QUIZ_QUESTIONS, questionId, { videoUrl: uploadResult.url, videoPath: storagePath });

    const updated = docToObject(await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(questionId).get());
    res.status(200).json({ success: true, message: 'Video uploaded successfully', data: { id: updated.id, videoUrl: updated.videoUrl, videoPath: updated.videoPath, question: updated } });
  } catch (error) {
    console.error('Error uploading quiz question video:', error);
    res.status(500).json({ success: false, error: 'Failed to upload video', message: error.message });
  }
}

export { uploadQuizVideo };
