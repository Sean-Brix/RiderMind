import { getDb, COLLECTIONS, snapshotToArray, docToObject } from '../../db/firestore.js';

export const getModulesAnalytics = async (req, res) => {
  try {
    const db = getDb();
    const [modSnap, smSnap] = await Promise.all([
      db.collection(COLLECTIONS.MODULES).where('isActive', '==', true).get(),
      db.collection(COLLECTIONS.STUDENT_MODULES).get(),
    ]);
    const modules = snapshotToArray(modSnap);
    const allStudentModules = snapshotToArray(smSnap);

    const now = new Date();
    const totalModules = modules.length;
    const totalEnrollments = allStudentModules.length;
    const completedModules = allStudentModules.filter(sm => sm.isCompleted).length;
    const avgCompletionRate = totalEnrollments > 0 ? Math.round(allStudentModules.reduce((s, sm) => s + (sm.progress || 0), 0) / totalEnrollments) : 0;

    let totalTimeMs = 0, countWithTime = 0;
    allStudentModules.forEach(sm => {
      if (sm.startedAt && sm.completedAt) {
        totalTimeMs += new Date(sm.completedAt) - new Date(sm.startedAt);
        countWithTime++;
      }
    });
    const avgHrs = countWithTime > 0 ? totalTimeMs / countWithTime / 3600000 : 0;
    const avgTimeToComplete = avgHrs < 1 ? `${Math.round(avgHrs * 60)} min` : avgHrs < 24 ? `${Math.round(avgHrs * 10) / 10} hrs` : `${Math.round(avgHrs / 24 * 10) / 10} days`;

    const enrollmentTrend = [];
    for (let i = 11; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      enrollmentTrend.push({ month: m.toLocaleDateString('en-US', { month: 'short' }), enrollments: allStudentModules.filter(sm => sm.createdAt >= m.toISOString() && sm.createdAt < next.toISOString()).length });
    }

    const skillLevelCounts = { Beginner: 0, Intermediate: 0, Expert: 0 };
    allStudentModules.forEach(sm => { if (skillLevelCounts[sm.skillLevel] !== undefined) skillLevelCounts[sm.skillLevel]++; });
    const skillLevelDistribution = Object.entries(skillLevelCounts).map(([level, enrollments]) => ({ level, enrollments }));

    const modulePerformance = modules.map(m => {
      const sms = allStudentModules.filter(sm => sm.moduleId === m.id);
      const completed = sms.filter(sm => sm.isCompleted).length;
      const scores = sms.map(sm => sm.quizScore).filter(s => s != null);
      return { name: m.title, enrollments: sms.length, completionRate: sms.length > 0 ? Math.round((completed / sms.length) * 100) : 0, avgScore: scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0 };
    });
    const topModules = [...modulePerformance].sort((a, b) => b.completionRate !== a.completionRate ? b.completionRate - a.completionRate : b.enrollments - a.enrollments).slice(0, 5);

    // Fetch user names for enrollment details
    const userIds = [...new Set(allStudentModules.map(sm => sm.userId))];
    const userDocs = await Promise.all(userIds.map(id => db.collection(COLLECTIONS.USERS).doc(id).get()));
    const userMap = {};
    userDocs.forEach(doc => { if (doc.exists) { const d = doc.data(); userMap[doc.id] = { name: [d.firstName, d.middleName, d.lastName].filter(Boolean).join(' ') || 'Unknown', email: d.email || 'N/A' }; } });
    const modMap = {};
    modules.forEach(m => modMap[m.id] = m.title);

    const studentModulesWithNames = allStudentModules.map(sm => ({ moduleTitle: modMap[sm.moduleId] || 'Unknown', userId: sm.userId, studentName: userMap[sm.userId]?.name || 'Unknown', studentEmail: userMap[sm.userId]?.email || 'N/A', progress: sm.progress, isCompleted: sm.isCompleted, skillLevel: sm.skillLevel, quizScore: sm.quizScore, startedAt: sm.startedAt, completedAt: sm.completedAt }));

    res.status(200).json({ success: true, data: { totalModules, totalEnrollments, completedModules, completionRate: avgCompletionRate, avgCompletionRate, avgTimeToComplete, enrollmentTrend, completionByCategory: [], skillLevelDistribution, modulePerformance: topModules, topModules, studentModules: studentModulesWithNames } });
  } catch (error) {
    console.error('Get modules analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve modules analytics', error: error.message });
  }
};
