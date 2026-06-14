import { getDb, COLLECTIONS, snapshotToArray } from '../../db/firestore.js';

export default async function getLeaderboard(req, res) {
  try {
    const { timeFrame = 'all-time', limit = 50 } = req.query;
    const limitNum = parseInt(limit);
    const db = getDb();

    const now = new Date();
    let dateFilter = null;
    if (timeFrame === 'month') dateFilter = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    else if (timeFrame === 'year') dateFilter = new Date(now.getFullYear(), 0, 1).toISOString();

    let smQuery = db.collection(COLLECTIONS.STUDENT_MODULES);
    if (dateFilter) smQuery = smQuery.where('updatedAt', '>=', dateFilter);
    const smSnap = await smQuery.get();
    const studentModules = snapshotToArray(smSnap);

    let qaQuery = db.collection(COLLECTIONS.QUIZ_ATTEMPTS);
    if (dateFilter) qaQuery = qaQuery.where('submittedAt', '>=', dateFilter);
    const qaSnap = await qaQuery.get();
    const quizAttempts = snapshotToArray(qaSnap);

    const userIds = [...new Set(studentModules.map(sm => sm.userId))];
    const userDocs = await Promise.all(userIds.map(id => db.collection(COLLECTIONS.USERS).doc(id).get()));
    const userMap = {};
    userDocs.forEach(doc => { if (doc.exists) userMap[doc.id] = doc.data(); });

    const userStats = {};
    studentModules.forEach(sm => {
      const uid = sm.userId;
      const u = userMap[uid];
      if (!userStats[uid]) {
        const nameParts = [u?.firstName, u?.middleName, u?.lastName].filter(Boolean);
        userStats[uid] = { userId: uid, displayName: nameParts.join(' ') || (u?.email?.split('@')[0] || 'Anonymous'), email: u?.email, totalModulesCompleted: 0, totalModulesInProgress: 0, totalQuizAttempts: 0, totalQuizzesPassed: 0, totalQuizScores: 0, quizScoreCount: 0, highestScore: 0, categories: [] };
      }
      if (sm.isCompleted) userStats[uid].totalModulesCompleted++;
      else if (sm.progress > 0) userStats[uid].totalModulesInProgress++;
      userStats[uid].totalQuizAttempts += sm.quizAttempts || 0;
      if (sm.quizScore != null) {
        userStats[uid].totalQuizScores += sm.quizScore;
        userStats[uid].quizScoreCount++;
        if (sm.quizScore > userStats[uid].highestScore) userStats[uid].highestScore = sm.quizScore;
      }
    });

    quizAttempts.forEach(a => {
      if (userStats[a.userId] && a.passed) userStats[a.userId].totalQuizzesPassed++;
    });

    const leaderboardData = Object.values(userStats).map(u => {
      const avg = u.quizScoreCount > 0 ? Math.round(u.totalQuizScores / u.quizScoreCount) : 0;
      const performanceScore = Math.max(0, Math.round(avg));
      return { ...u, averageQuizScore: avg, performanceScore, passRate: u.totalQuizAttempts > 0 ? Math.round((u.totalQuizzesPassed / u.totalQuizAttempts) * 100) : 0 };
    });

    leaderboardData.sort((a, b) => {
      if (b.performanceScore !== a.performanceScore) return b.performanceScore - a.performanceScore;
      if (b.averageQuizScore !== a.averageQuizScore) return b.averageQuizScore - a.averageQuizScore;
      if (b.totalModulesCompleted !== a.totalModulesCompleted) return b.totalModulesCompleted - a.totalModulesCompleted;
      return b.totalQuizAttempts - a.totalQuizAttempts;
    });

    const ranked = leaderboardData.slice(0, limitNum).map((u, i) => ({ ...u, rank: i + 1 }));
    res.status(200).json({ success: true, data: ranked, timeFrame, totalUsers: leaderboardData.length, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard', details: error.message });
  }
}
