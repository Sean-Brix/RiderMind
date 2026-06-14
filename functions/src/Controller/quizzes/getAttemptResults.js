import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';

export default async function getAttemptResults(req, res) {
  try {
    const { attemptId } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';
    const db = getDb();

    const attDoc = await db.collection(COLLECTIONS.QUIZ_ATTEMPTS).doc(attemptId).get();
    const attempt = docToObject(attDoc);
    if (!attempt) return res.status(404).json({ success: false, error: 'Attempt not found' });

    if (!isAdmin && attempt.userId !== userId) {
      return res.status(403).json({ success: false, error: 'You do not have permission to view this attempt' });
    }

    const quizDoc = await db.collection(COLLECTIONS.QUIZZES).doc(attempt.quizId).get();
    const quiz = docToObject(quizDoc);

    if (!isAdmin && quiz && !quiz.allowReview) {
      return res.status(403).json({ success: false, error: 'Review is not allowed for this quiz' });
    }

    let module = null;
    if (quiz?.moduleId) {
      const mDoc = await db.collection(COLLECTIONS.MODULES).doc(quiz.moduleId).get();
      if (mDoc.exists) module = { id: mDoc.id, title: mDoc.data().title };
    }

    const answers = attempt.answers || [];
    const maxScore = answers.reduce((sum, a) => sum + (a.points || 0), 0);
    const totalScore = answers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);

    let userInfo = null;
    if (isAdmin) {
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(attempt.userId).get();
      if (userDoc.exists) {
        const u = userDoc.data();
        userInfo = { id: userDoc.id, email: u.email, first_name: u.first_name, last_name: u.last_name };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        id: attempt.id, score: attempt.score, totalScore, maxScore,
        passed: attempt.passed, passingScore: quiz?.passingScore,
        timeSpent: attempt.timeSpent, startedAt: attempt.startedAt, submittedAt: attempt.submittedAt,
        quiz: quiz ? { ...quiz, module } : null,
        user: isAdmin ? userInfo : undefined,
        answers: (quiz?.showResults || isAdmin) ? answers : undefined,
      }
    });
  } catch (error) {
    console.error('Error fetching attempt results:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch attempt results', message: error.message });
  }
}
