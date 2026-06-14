import { v4 as uuidv4 } from 'uuid';
import { getDb, COLLECTIONS, docToObject, updateDoc, snapshotToArray } from '../../db/firestore.js';

export default async function updateQuiz(req, res) {
  try {
    const { id } = req.params;
    const { title, description, instructions, passingScore, timeLimit,
      shuffleQuestions, showResults, isActive, questions } = req.body;
    const db = getDb();

    const quizDoc = await db.collection(COLLECTIONS.QUIZZES).doc(id).get();
    const existing = docToObject(quizDoc);
    if (!existing) return res.status(404).json({ success: false, error: 'Quiz not found' });

    if (title && title !== existing.title) {
      const dupSnap = await db.collection(COLLECTIONS.QUIZZES)
        .where('moduleId', '==', existing.moduleId).where('title', '==', title).limit(1).get();
      if (!dupSnap.empty && dupSnap.docs[0].id !== id) {
        return res.status(409).json({ success: false, error: 'Quiz with this title already exists in this module' });
      }
    }

    const data = { updatedBy: req.user?.id || null };
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (instructions !== undefined) data.instructions = instructions;
    if (passingScore !== undefined) data.passingScore = passingScore;
    if (timeLimit !== undefined) data.timeLimit = timeLimit;
    if (shuffleQuestions !== undefined) data.shuffleQuestions = shuffleQuestions;
    if (showResults !== undefined) data.showResults = showResults;
    if (isActive !== undefined) data.isActive = isActive;

    await updateDoc(COLLECTIONS.QUIZZES, id, data);

    if (questions && Array.isArray(questions)) {
      const ts = new Date().toISOString();
      const questionsToUpdate = questions.filter(q => q.id);
      const questionsToCreate = questions.filter(q => !q.id);
      const keepIds = new Set(questionsToUpdate.map(q => q.id));

      // Delete removed questions
      const allQSnap = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).where('quizId', '==', id).get();
      const delBatch = db.batch();
      allQSnap.docs.filter(d => !keepIds.has(d.id)).forEach(d => delBatch.delete(d.ref));
      await delBatch.commit();

      // Update existing
      for (const q of questionsToUpdate) {
        const opts = (q.options || []).map((opt, oi) => ({
          id: opt.id || uuidv4(), optionText: opt.optionText, isCorrect: opt.isCorrect === true,
          position: opt.position || oi + 1, imageUrl: opt.imageUrl || null,
          imagePath: opt.imagePath || null, imageMime: opt.imageMime || null,
        }));
        await db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc(q.id).update({
          type: q.type, question: q.question, description: q.description || null,
          points: q.points || 1, position: q.position, caseSensitive: q.caseSensitive || false,
          shuffleOptions: q.shuffleOptions !== undefined ? q.shuffleOptions : false,
          imageUrl: q.imageUrl || null, imagePath: q.imagePath || null, imageMime: q.imageMime || null,
          videoUrl: q.videoUrl || null, videoPath: q.videoPath || null, options: opts, updatedAt: ts,
        });
      }

      // Create new
      for (let i = 0; i < questionsToCreate.length; i++) {
        const q = questionsToCreate[i];
        const opts = (q.options || []).map((opt, oi) => ({
          id: uuidv4(), optionText: opt.optionText, isCorrect: opt.isCorrect === true,
          position: opt.position || oi + 1, imageUrl: opt.imageUrl || null,
          imagePath: opt.imagePath || null, imageMime: opt.imageMime || null,
        }));
        const qRef = db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc();
        await qRef.set({
          quizId: id, type: q.type, question: q.question, description: q.description || null,
          points: q.points || 1, position: q.position || (questionsToUpdate.length + i + 1),
          caseSensitive: q.caseSensitive || false, shuffleOptions: q.shuffleOptions !== undefined ? q.shuffleOptions : false,
          imageUrl: q.imageUrl || null, imagePath: q.imagePath || null, imageMime: q.imageMime || null,
          videoUrl: q.videoUrl || null, videoPath: q.videoPath || null, options: opts, createdAt: ts, updatedAt: ts,
        });
      }
    }

    const updatedQuizDoc = await db.collection(COLLECTIONS.QUIZZES).doc(id).get();
    const updatedQSnap = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).where('quizId', '==', id).orderBy('position', 'asc').get();
    const modDoc = existing.moduleId ? await db.collection(COLLECTIONS.MODULES).doc(existing.moduleId).get() : null;
    const module = modDoc?.exists ? { id: modDoc.id, title: modDoc.data().title, description: modDoc.data().description } : null;

    res.status(200).json({ success: true, message: 'Quiz updated successfully', data: { ...docToObject(updatedQuizDoc), module, questions: snapshotToArray(updatedQSnap), _count: { questions: updatedQSnap.size } } });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ success: false, error: 'Failed to update quiz', message: error.message });
  }
}
