import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function getQuizById(req, res) {
  try {
    const { id } = req.params;
    const { includeCorrectAnswers } = req.query;
    const isAdmin = req.user?.role === 'ADMIN';
    const showAnswers = (includeCorrectAnswers === 'true') && isAdmin;
    const db = getDb();

    const quizDoc = await db.collection(COLLECTIONS.QUIZZES).doc(id).get();
    const quiz = docToObject(quizDoc);
    if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found' });

    const modDoc = quiz.moduleId ? await db.collection(COLLECTIONS.MODULES).doc(quiz.moduleId).get() : null;
    const module = modDoc ? { id: modDoc.id, title: modDoc.data()?.title, description: modDoc.data()?.description } : null;

    const qSnap = await db.collection(COLLECTIONS.QUIZ_QUESTIONS)
      .where('quizId', '==', id).orderBy('position', 'asc').get();
    let questions = snapshotToArray(qSnap);

    if (!showAnswers && quiz.shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    questions = questions.map(q => {
      let options = q.options || [];
      if (q.shuffleOptions && !showAnswers) options = [...options].sort(() => Math.random() - 0.5);
      if (!showAnswers) options = options.map(({ isCorrect, ...opt }) => opt);
      return { ...q, options, hasImage: !!q.imageMime };
    });

    res.status(200).json({ success: true, data: { ...quiz, module, questions } });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch quiz', message: error.message });
  }
}
