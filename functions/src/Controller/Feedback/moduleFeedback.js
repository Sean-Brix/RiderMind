import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

async function findFeedback(db, userId, moduleId) {
  const snap = await db.collection(COLLECTIONS.MODULE_FEEDBACK).where('userId', '==', userId).where('moduleId', '==', moduleId).limit(1).get();
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function submitModuleFeedback(req, res) {
  try {
    const userId = req.user.id;
    const { moduleId, rating, comment, isLike } = req.body;
    if (!moduleId) return res.status(400).json({ success: false, error: 'moduleId is required' });

    const db = getDb();
    const ts = new Date().toISOString();
    const existing = await findFeedback(db, userId, moduleId);

    let result;
    if (existing) {
      const data = { updatedAt: ts };
      if (rating !== undefined) data.rating = rating;
      if (comment !== undefined) data.comment = comment;
      if (isLike !== undefined) data.isLike = isLike;
      await db.collection(COLLECTIONS.MODULE_FEEDBACK).doc(existing.id).update(data);
      result = docToObject(await db.collection(COLLECTIONS.MODULE_FEEDBACK).doc(existing.id).get());
    } else {
      const ref = db.collection(COLLECTIONS.MODULE_FEEDBACK).doc();
      const data = { userId, moduleId, rating: rating || null, comment: comment || null, isLike: isLike !== undefined ? isLike : null, isActive: true, createdAt: ts, updatedAt: ts };
      await ref.set(data);
      result = { id: ref.id, ...data };
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to submit feedback', message: error.message });
  }
}

export async function getModuleFeedback(req, res) {
  try {
    const { moduleId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const db = getDb();

    const snap = await db.collection(COLLECTIONS.MODULE_FEEDBACK).where('moduleId', '==', moduleId).where('isActive', '==', true).get();
    const all = snapshotToArray(snap).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const pageNum = parseInt(page);
    const pageSize = parseInt(limit);
    const paginated = all.slice((pageNum - 1) * pageSize, pageNum * pageSize);

    const enriched = await Promise.all(paginated.map(async f => {
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(f.userId).get();
      const u = docToObject(userDoc);
      return { ...f, user: u ? { id: u.id, firstName: u.firstName, lastName: u.lastName, profilePicture: u.profilePicture } : null };
    }));

    res.status(200).json({ success: true, data: enriched, pagination: { total: all.length, page: pageNum, limit: pageSize, totalPages: Math.ceil(all.length / pageSize) } });
  } catch (error) {
    console.error('Error fetching module feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch feedback', message: error.message });
  }
}

export async function getModuleFeedbackStats(req, res) {
  try {
    const { moduleId } = req.params;
    const db = getDb();
    const snap = await db.collection(COLLECTIONS.MODULE_FEEDBACK).where('moduleId', '==', moduleId).where('isActive', '==', true).get();
    const feedbacks = snapshotToArray(snap);
    const total = feedbacks.length;
    const likes = feedbacks.filter(f => f.isLike === true).length;
    const dislikes = feedbacks.filter(f => f.isLike === false).length;
    const rated = feedbacks.filter(f => f.rating);
    const avgRating = rated.length ? rated.reduce((s, f) => s + f.rating, 0) / rated.length : 0;
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    rated.forEach(f => { if (f.rating >= 1 && f.rating <= 5) dist[f.rating]++; });
    res.status(200).json({ success: true, data: { totalFeedbacks: total, likes, dislikes, likePercentage: total > 0 ? Math.round((likes / total) * 100) : 0, avgRating: Math.round(avgRating * 10) / 10, ratingDistribution: dist } });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch feedback stats', message: error.message });
  }
}

export async function getMyModuleFeedback(req, res) {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;
    const db = getDb();
    const feedback = await findFeedback(db, userId, moduleId);
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    console.error('Error fetching my feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch feedback', message: error.message });
  }
}

export async function deleteModuleFeedback(req, res) {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;
    const db = getDb();
    const existing = await findFeedback(db, userId, moduleId);
    if (!existing) return res.status(404).json({ success: false, error: 'Feedback not found' });
    await db.collection(COLLECTIONS.MODULE_FEEDBACK).doc(existing.id).update({ isActive: false, updatedAt: new Date().toISOString() });
    res.status(200).json({ success: true, message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to delete feedback', message: error.message });
  }
}

export async function getAllModuleFeedback(req, res) {
  try {
    const { moduleId, isActive, page = 1, limit = 20, search } = req.query;
    const db = getDb();

    let query = db.collection(COLLECTIONS.MODULE_FEEDBACK);
    if (moduleId) query = query.where('moduleId', '==', moduleId);
    if (isActive !== undefined) query = query.where('isActive', '==', isActive === 'true');

    const snap = await query.get();
    let feedbacks = snapshotToArray(snap).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (search) {
      const s = search.toLowerCase();
      feedbacks = feedbacks.filter(f => (f.comment || '').toLowerCase().includes(s));
    }

    const pageNum = parseInt(page);
    const pageSize = parseInt(limit);
    const paginated = feedbacks.slice((pageNum - 1) * pageSize, pageNum * pageSize);

    const enriched = await Promise.all(paginated.map(async f => {
      const [userDoc, modDoc] = await Promise.all([
        db.collection(COLLECTIONS.USERS).doc(f.userId).get(),
        db.collection(COLLECTIONS.MODULES).doc(f.moduleId).get(),
      ]);
      const u = docToObject(userDoc);
      return { ...f, user: u ? { id: u.id, firstName: u.firstName, lastName: u.lastName } : null, module: docToObject(modDoc) };
    }));

    res.status(200).json({ success: true, data: enriched, pagination: { total: feedbacks.length, page: pageNum, limit: pageSize, totalPages: Math.ceil(feedbacks.length / pageSize) } });
  } catch (error) {
    console.error('Error fetching all feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch feedback', message: error.message });
  }
}
