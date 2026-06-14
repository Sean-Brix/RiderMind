import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

async function findReaction(db, userId, questionId) {
  const snap = await db.collection(COLLECTIONS.QUIZ_REACTIONS).where('userId', '==', userId).where('questionId', '==', questionId).limit(1).get();
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function toggleQuizReaction(req, res) {
  try {
    const userId = req.user.id;
    const { questionId } = req.params;
    const { isLike } = req.body;
    if (isLike === undefined) return res.status(400).json({ success: false, error: 'isLike is required' });

    const db = getDb();
    const existing = await findReaction(db, userId, questionId);
    const ts = new Date().toISOString();
    let result, action;

    if (existing && existing.isLike === isLike) {
      await db.collection(COLLECTIONS.QUIZ_REACTIONS).doc(existing.id).delete();
      action = 'removed';
      result = null;
    } else if (existing) {
      await db.collection(COLLECTIONS.QUIZ_REACTIONS).doc(existing.id).update({ isLike, updatedAt: ts });
      result = docToObject(await db.collection(COLLECTIONS.QUIZ_REACTIONS).doc(existing.id).get());
      action = 'updated';
    } else {
      const ref = db.collection(COLLECTIONS.QUIZ_REACTIONS).doc();
      const data = { userId, questionId, isLike, createdAt: ts, updatedAt: ts };
      await ref.set(data);
      result = { id: ref.id, ...data };
      action = 'created';
    }
    res.status(200).json({ success: true, action, data: result });
  } catch (error) {
    console.error('Error toggling reaction:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle reaction', message: error.message });
  }
}

export async function getQuestionReactionStats(req, res) {
  try {
    const { questionId } = req.params;
    const db = getDb();
    const snap = await db.collection(COLLECTIONS.QUIZ_REACTIONS).where('questionId', '==', questionId).get();
    const reactions = snapshotToArray(snap);
    const likes = reactions.filter(r => r.isLike === true).length;
    const dislikes = reactions.filter(r => r.isLike === false).length;
    res.status(200).json({ success: true, data: { questionId, likes, dislikes, total: reactions.length } });
  } catch (error) {
    console.error('Error fetching reaction stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reaction stats', message: error.message });
  }
}

export async function getMyQuestionReaction(req, res) {
  try {
    const userId = req.user.id;
    const { questionId } = req.params;
    const db = getDb();
    const reaction = await findReaction(db, userId, questionId);
    res.status(200).json({ success: true, data: reaction });
  } catch (error) {
    console.error('Error fetching my reaction:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reaction', message: error.message });
  }
}

export async function getQuizReactions(req, res) {
  try {
    const { quizId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const db = getDb();

    const qSnap = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).where('quizId', '==', quizId).get();
    const questionIds = qSnap.docs.map(d => d.id);

    if (!questionIds.length) return res.status(200).json({ success: true, data: [] });

    const allReactions = await Promise.all(questionIds.map(qId =>
      db.collection(COLLECTIONS.QUIZ_REACTIONS).where('questionId', '==', qId).get().then(snapshotToArray)
    ));
    let reactions = allReactions.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const pageNum = parseInt(page);
    const pageSize = parseInt(limit);
    const paginated = reactions.slice((pageNum - 1) * pageSize, pageNum * pageSize);

    res.status(200).json({ success: true, data: paginated, pagination: { total: reactions.length, page: pageNum, limit: pageSize, totalPages: Math.ceil(reactions.length / pageSize) } });
  } catch (error) {
    console.error('Error fetching quiz reactions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reactions', message: error.message });
  }
}

export async function deleteQuizReaction(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();
    const doc = await db.collection(COLLECTIONS.QUIZ_REACTIONS).doc(id).get();
    if (!docToObject(doc)) return res.status(404).json({ success: false, error: 'Reaction not found' });
    await db.collection(COLLECTIONS.QUIZ_REACTIONS).doc(id).delete();
    res.status(200).json({ success: true, message: 'Reaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting reaction:', error);
    res.status(500).json({ success: false, error: 'Failed to delete reaction', message: error.message });
  }
}
