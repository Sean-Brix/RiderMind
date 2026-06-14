import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function getMyDetails(req, res) {
  try {
    const userId = req.user.id;
    const db = getDb();

    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    const user = docToObject(userDoc);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const { password: _, resetToken: __, resetTokenExpiry: ___, ...safeUser } = user;

    const [smSnap, regSnap] = await Promise.all([
      db.collection(COLLECTIONS.STUDENT_MODULES).where('userId', '==', userId).get(),
      db.collection(COLLECTIONS.REGISTRATION_REQUESTS).where('userId', '==', userId).orderBy('createdAt', 'desc').limit(1).get(),
    ]);

    const studentModules = snapshotToArray(smSnap);
    const total = studentModules.length;
    const completed = studentModules.filter(sm => sm.isCompleted).length;
    const registrationRequest = regSnap.empty ? null : { id: regSnap.docs[0].id, ...regSnap.docs[0].data() };

    res.status(200).json({ success: true, data: { ...safeUser, progress: { total, completed, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0 }, registrationRequest } });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user details', message: error.message });
  }
}
