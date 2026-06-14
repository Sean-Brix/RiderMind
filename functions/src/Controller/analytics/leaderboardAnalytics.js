import { getDb, COLLECTIONS, snapshotToArray } from '../../db/firestore.js';

export const getLeaderboardAnalytics = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);
    const db = getDb();

    const [smSnap, qaSnap] = await Promise.all([
      db.collection(COLLECTIONS.STUDENT_MODULES).get(),
      db.collection(COLLECTIONS.QUIZ_ATTEMPTS).get(),
    ]);
    const studentModules = snapshotToArray(smSnap);
    const quizAttempts = snapshotToArray(qaSnap);

    const userIds = [...new Set(studentModules.map(sm => sm.userId))];
    const userDocs = await Promise.all(userIds.map(id => db.collection(COLLECTIONS.USERS).doc(id).get()));
    const userMap = {};
    userDocs.forEach(doc => { if (doc.exists) { const d = doc.data(); if (d.role !== 'ADMIN') userMap[doc.id] = d; } });

    const userStats = {};
    studentModules.forEach(sm => {
      const uid = sm.userId;
      if (!userMap[uid]) return;
      const u = userMap[uid];
      if (!userStats[uid]) {
        const nameParts = [u.firstName, u.middleName, u.lastName].filter(Boolean);
        userStats[uid] = { userId: uid, name: nameParts.join(' ') || (u.email?.split('@')[0] || 'Anonymous'), modulesCompleted: 0, quizzesTaken: 0, quizzesPassed: 0, totalQuizScore: 0, quizScoreCount: 0 };
      }
      if (sm.isCompleted) userStats[uid].modulesCompleted++;
      if (sm.quizScore != null) { userStats[uid].totalQuizScore += sm.quizScore; userStats[uid].quizScoreCount++; }
    });

    quizAttempts.forEach(a => {
      if (userStats[a.userId]) { userStats[a.userId].quizzesTaken++; if (a.passed) userStats[a.userId].quizzesPassed++; }
    });

    const leaderboardData = Object.values(userStats).map(u => {
      const avgScore = u.quizScoreCount > 0 ? Math.round(u.totalQuizScore / u.quizScoreCount) : 0;
      const score = Math.round(u.modulesCompleted * 10 + u.quizzesPassed * 5 + avgScore * 2);
      let level = 1;
      if (score >= 1000) level = 10; else if (score >= 800) level = 9; else if (score >= 600) level = 8;
      else if (score >= 500) level = 7; else if (score >= 400) level = 6; else if (score >= 300) level = 5;
      else if (score >= 200) level = 4; else if (score >= 100) level = 3; else if (score >= 50) level = 2;
      return { name: u.name, score, level, modules: u.modulesCompleted, quizzes: u.quizzesTaken, avgScore };
    });

    leaderboardData.sort((a, b) => b.score !== a.score ? b.score - a.score : b.avgScore !== a.avgScore ? b.avgScore - a.avgScore : b.modules - a.modules);

    res.status(200).json({ success: true, data: leaderboardData.slice(0, limitNum).map((u, i) => ({ rank: i + 1, ...u })) });
  } catch (error) {
    console.error('Error fetching leaderboard analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard analytics', error: error.message });
  }
};
