import { getDb, COLLECTIONS, snapshotToArray } from '../../db/firestore.js';

export const getQuizzesAnalytics = async (req, res) => {
  try {
    const db = getDb();
    const [quizSnap, attemptSnap] = await Promise.all([
      db.collection(COLLECTIONS.QUIZZES).where('isActive', '==', true).get(),
      db.collection(COLLECTIONS.QUIZ_ATTEMPTS).get(),
    ]);
    const quizzes = snapshotToArray(quizSnap);
    const attempts = snapshotToArray(attemptSnap);

    const now = new Date();
    const totalQuizzes = quizzes.length;
    const totalAttempts = attempts.length;
    const avgScore = totalAttempts > 0 ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / totalAttempts) : 0;
    const passedAttempts = attempts.filter(a => a.passed).length;
    const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

    const attemptsOverTime = [];
    for (let i = 11; i >= 0; i--) {
      const wStart = new Date(now); wStart.setDate(wStart.getDate() - i * 7);
      const wEnd = new Date(wStart); wEnd.setDate(wEnd.getDate() + 7);
      attemptsOverTime.push({ week: `Week ${12 - i}`, attempts: attempts.filter(a => a.submittedAt >= wStart.toISOString() && a.submittedAt < wEnd.toISOString()).length });
    }

    const scoreRanges = [{ range: '0-20', count: 0 }, { range: '21-40', count: 0 }, { range: '41-60', count: 0 }, { range: '61-80', count: 0 }, { range: '81-100', count: 0 }];
    attempts.forEach(a => {
      if (a.score <= 20) scoreRanges[0].count++;
      else if (a.score <= 40) scoreRanges[1].count++;
      else if (a.score <= 60) scoreRanges[2].count++;
      else if (a.score <= 80) scoreRanges[3].count++;
      else scoreRanges[4].count++;
    });

    // Quiz performance (per quiz)
    const quizPerformance = quizzes.map(q => {
      const qa = attempts.filter(a => a.quizId === q.id);
      return { name: q.title, attempts: qa.length, passed: qa.filter(a => a.passed).length };
    }).filter(q => q.attempts > 0).sort((a, b) => b.attempts - a.attempts).slice(0, 10);

    const difficultyStats = {};
    quizzes.forEach(q => {
      const qa = attempts.filter(a => a.quizId === q.id);
      if (qa.length > 0) {
        const pr = (qa.filter(a => a.passed).length / qa.length) * 100;
        const d = pr >= 80 ? 'Easy' : pr >= 60 ? 'Medium' : pr >= 40 ? 'Hard' : 'Very Hard';
        difficultyStats[d] = (difficultyStats[d] || 0) + 1;
      }
    });

    res.status(200).json({ success: true, data: { totalQuizzes, totalAttempts, avgScore, passRate, passedAttempts, attemptsOverTime, scoreDistribution: scoreRanges, categoryPerformance: [], quizPerformance, difficultyDistribution: ['Easy', 'Medium', 'Hard', 'Very Hard'].map(d => ({ difficulty: d, count: difficultyStats[d] || 0 })) } });
  } catch (error) {
    console.error('Get quizzes analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve quizzes analytics', error: error.message });
  }
};
