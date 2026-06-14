import { getDb, COLLECTIONS, snapshotToArray } from '../../db/firestore.js';

export default async function getQuizzes(req, res) {
  try {
    const { moduleId, includeQuestions, includeOptions } = req.query;
    const db = getDb();

    let query = db.collection(COLLECTIONS.QUIZZES).orderBy('createdAt', 'desc');
    if (moduleId) query = query.where('moduleId', '==', moduleId);

    const snap = await query.get();
    let quizzes = snapshotToArray(snap);

    const modSnap = await db.collection(COLLECTIONS.MODULES).get();
    const modMap = {};
    modSnap.docs.forEach(d => { modMap[d.id] = { id: d.id, title: d.data().title, description: d.data().description }; });

    if (includeQuestions === 'true') {
      quizzes = await Promise.all(quizzes.map(async quiz => {
        const qSnap = await db.collection(COLLECTIONS.QUIZ_QUESTIONS)
          .where('quizId', '==', quiz.id).orderBy('position', 'asc').get();
        let questions = snapshotToArray(qSnap);
        if (includeOptions !== 'true') {
          questions = questions.map(({ options, ...q }) => q);
        }
        const questionsCount = questions.length;
        return { ...quiz, module: modMap[quiz.moduleId] || null, questions, _count: { questions: questionsCount } };
      }));
    } else {
      quizzes = await Promise.all(quizzes.map(async quiz => {
        const qSnap = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).where('quizId', '==', quiz.id).get();
        return { ...quiz, module: modMap[quiz.moduleId] || null, _count: { questions: qSnap.size } };
      }));
    }

    res.status(200).json({ success: true, count: quizzes.length, data: quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch quizzes', message: error.message });
  }
}
