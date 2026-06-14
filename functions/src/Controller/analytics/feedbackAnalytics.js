import { getDb, COLLECTIONS, snapshotToArray, docToObject } from '../../db/firestore.js';

export const getModuleFeedbackAnalytics = async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection(COLLECTIONS.MODULE_FEEDBACK).where('isActive', '==', true).get();
    const feedbacks = snapshotToArray(snap);

    if (!feedbacks.length) {
      return res.status(200).json({ success: true, data: { totalFeedback: 0, positive: 0, neutral: 0, negative: 0, avgRating: 0, sentimentTrend: [], ratingDistribution: [], categoryBreakdown: [] } });
    }

    const withRating = feedbacks.filter(f => f.rating != null);
    const positive = withRating.filter(f => f.rating >= 4).length;
    const neutral = withRating.filter(f => f.rating === 3).length;
    const negative = withRating.filter(f => f.rating <= 2).length;
    const avgRating = withRating.length ? parseFloat((withRating.reduce((s, f) => s + f.rating, 0) / withRating.length).toFixed(1)) : 0;

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({ stars: `${star} Star${star !== 1 ? 's' : ''}`, count: withRating.filter(f => f.rating === star).length }));

    const modIds = [...new Set(feedbacks.map(f => f.moduleId))];
    const modDocs = await Promise.all(modIds.map(id => db.collection(COLLECTIONS.MODULES).doc(id).get()));
    const modMap = {};
    modDocs.forEach(doc => { if (doc.exists) modMap[doc.id] = doc.data().title; });

    const moduleStats = {};
    feedbacks.forEach(f => {
      if (!moduleStats[f.moduleId]) moduleStats[f.moduleId] = { category: modMap[f.moduleId] || `Module ${f.moduleId}`, count: 0, totalRating: 0 };
      moduleStats[f.moduleId].count++;
      if (f.rating != null) moduleStats[f.moduleId].totalRating += f.rating;
    });
    const categoryBreakdown = Object.values(moduleStats).map(s => ({ category: s.category, count: s.count, avgRating: s.count > 0 ? parseFloat((s.totalRating / s.count).toFixed(1)) : 0 })).sort((a, b) => b.count - a.count).slice(0, 5);

    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recent = feedbacks.filter(f => f.createdAt >= sixMonthsAgo.toISOString());
    const monthlyData = {};
    recent.forEach(f => {
      const key = f.createdAt.substring(0, 7);
      if (!monthlyData[key]) monthlyData[key] = { positive: 0, neutral: 0, negative: 0 };
      if (f.rating >= 4) monthlyData[key].positive++;
      else if (f.rating === 3) monthlyData[key].neutral++;
      else monthlyData[key].negative++;
    });
    const sentimentTrend = Object.entries(monthlyData).sort((a, b) => a[0].localeCompare(b[0])).map(([month, data]) => ({ month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }), ...data }));

    res.status(200).json({ success: true, data: { totalFeedback: feedbacks.length, positive, neutral, negative, avgRating, sentimentTrend, ratingDistribution, categoryBreakdown } });
  } catch (error) {
    console.error('Get module feedback analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve module feedback analytics', error: error.message });
  }
};

export const getQuizReactionAnalytics = async (req, res) => {
  try {
    const db = getDb();
    const [reactionSnap, questionSnap, quizSnap] = await Promise.all([
      db.collection(COLLECTIONS.QUIZ_REACTIONS).get(),
      db.collection(COLLECTIONS.QUIZ_QUESTIONS).get(),
      db.collection(COLLECTIONS.QUIZZES).get(),
    ]);
    const reactions = snapshotToArray(reactionSnap);
    const questions = snapshotToArray(questionSnap);
    const quizzes = snapshotToArray(quizSnap);

    if (!reactions.length) {
      return res.status(200).json({ success: true, data: { totalReactions: 0, likes: 0, dislikes: 0, likePercentage: 0, topQuizzes: [] } });
    }

    const likes = reactions.filter(r => r.isLike).length;
    const dislikes = reactions.filter(r => !r.isLike).length;
    const likePercentage = parseFloat(((likes / reactions.length) * 100).toFixed(1));

    const qMap = {};
    questions.forEach(q => qMap[q.id] = q);
    const quizMap = {};
    quizzes.forEach(qz => quizMap[qz.id] = qz);

    const quizStats = {};
    reactions.forEach(r => {
      const q = qMap[r.questionId];
      const quizId = q?.quizId;
      if (!quizId) return;
      const quizName = quizMap[quizId]?.title || `Quiz ${quizId}`;
      if (!quizStats[quizId]) quizStats[quizId] = { quizName, likes: 0, dislikes: 0, total: 0 };
      quizStats[quizId].total++;
      if (r.isLike) quizStats[quizId].likes++; else quizStats[quizId].dislikes++;
    });

    const topQuizzes = Object.values(quizStats).map(s => ({ ...s, likePercentage: parseFloat(((s.likes / s.total) * 100).toFixed(1)) })).sort((a, b) => b.likePercentage - a.likePercentage).slice(0, 10);

    res.status(200).json({ success: true, data: { totalReactions: reactions.length, likes, dislikes, likePercentage, topQuizzes } });
  } catch (error) {
    console.error('Get quiz reaction analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve quiz reaction analytics', error: error.message });
  }
};
