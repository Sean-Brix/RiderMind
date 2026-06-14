import { getDb, COLLECTIONS, snapshotToArray } from '../../db/firestore.js';

export default async function getStudentModuleStats(req, res) {
  try {
    const db = getDb();
    const snap = await db.collection(COLLECTIONS.STUDENT_MODULES).get();
    const all = snapshotToArray(snap);

    const total = all.length;
    const ongoing = all.filter(sm => sm.status === 'ONGOING').length;
    const completed = all.filter(sm => sm.status === 'COMPLETED').length;
    const withProgress = all.filter(sm => sm.progress > 0);
    const avgProgress = withProgress.length ? withProgress.reduce((s, sm) => s + (sm.progress || 0), 0) / withProgress.length : 0;
    const quizPassed = all.filter(sm => sm.quizPassed).length;
    const quizAttempted = all.filter(sm => (sm.quizAttempts || 0) > 0);
    const avgScore = quizAttempted.length ? quizAttempted.reduce((s, sm) => s + (sm.quizScore || 0), 0) / quizAttempted.length : 0;

    res.status(200).json({
      success: true,
      data: { total, ongoing, completed, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0, avgProgress: Math.round(avgProgress * 10) / 10, quizPassed, avgQuizScore: Math.round(avgScore * 10) / 10 },
    });
  } catch (error) {
    console.error('Error fetching student module stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats', message: error.message });
  }
}
