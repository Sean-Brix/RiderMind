import { v4 as uuidv4 } from 'uuid';
import { getDb, COLLECTIONS, createDoc, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function createQuiz(req, res) {
  try {
    const { moduleId, title, description, instructions, passingScore, timeLimit,
      shuffleQuestions, showResults, allowReview, maxAttempts, questions } = req.body;
    const db = getDb();

    if (!title) return res.status(400).json({ success: false, error: 'Title is required' });

    if (moduleId) {
      const modDoc = await db.collection(COLLECTIONS.MODULES).doc(moduleId).get();
      if (!docToObject(modDoc)) return res.status(404).json({ success: false, error: 'Module not found' });

      const dupSnap = await db.collection(COLLECTIONS.QUIZZES)
        .where('moduleId', '==', moduleId).where('title', '==', title).limit(1).get();
      if (!dupSnap.empty) return res.status(409).json({ success: false, error: 'Quiz with this title already exists in this module' });
    }

    const quiz = await createDoc(COLLECTIONS.QUIZZES, {
      title, description: description || null, instructions: instructions || null,
      passingScore: passingScore || 70, timeLimit: timeLimit || null,
      shuffleQuestions: shuffleQuestions !== undefined ? shuffleQuestions : false,
      showResults: showResults !== undefined ? showResults : true,
      allowReview: allowReview !== undefined ? allowReview : true,
      maxAttempts: maxAttempts || null, moduleId: moduleId || null, isActive: false,
      createdBy: req.user?.id || null, updatedBy: req.user?.id || null,
    });

    const savedQuestions = [];
    if (questions && Array.isArray(questions)) {
      const ts = new Date().toISOString();
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const opts = (q.options || []).map((opt, oi) => ({
          id: uuidv4(), optionText: opt.optionText, isCorrect: opt.isCorrect === true,
          position: opt.position || oi + 1, imageUrl: opt.imageUrl || null,
          imagePath: opt.imagePath || null, imageMime: opt.imageMime || null,
        }));
        const qRef = db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc();
        const qData = {
          quizId: quiz.id, type: q.type, question: q.question, description: q.description || null,
          points: q.points || 1, position: q.position || i + 1, caseSensitive: q.caseSensitive || false,
          shuffleOptions: q.shuffleOptions !== undefined ? q.shuffleOptions : false,
          imageUrl: q.imageUrl || null, imagePath: q.imagePath || null, imageMime: q.imageMime || null,
          videoUrl: q.videoUrl || null, videoPath: q.videoPath || null, options: opts,
          createdAt: ts, updatedAt: ts,
        };
        await qRef.set(qData);
        savedQuestions.push({ id: qRef.id, ...qData });
      }
    }

    const modDoc = quiz.moduleId ? await db.collection(COLLECTIONS.MODULES).doc(quiz.moduleId).get() : null;
    const module = modDoc?.exists ? { id: modDoc.id, title: modDoc.data().title, description: modDoc.data().description } : null;

    res.status(201).json({ success: true, message: 'Quiz created successfully', data: { ...quiz, module, questions: savedQuestions, _count: { questions: savedQuestions.length } } });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ success: false, error: 'Failed to create quiz', message: error.message });
  }
}
