import { getDb, COLLECTIONS } from '../../db/firestore.js';

export default async function markModulesCompleted(req, res) {
  try {
    const userId = req.user.id;
    const db = getDb();

    const smSnap = await db.collection(COLLECTIONS.STUDENT_MODULES)
      .where('userId', '==', userId).where('status', '==', 'ONGOING').get();

    const batch = db.batch();
    const ts = new Date().toISOString();
    smSnap.docs.forEach(d => batch.update(d.ref, { status: 'COMPLETED', updatedAt: ts }));
    await batch.commit();

    res.json({ success: true, message: `Successfully marked ${smSnap.size} module(s) as completed`, count: smSnap.size });
  } catch (error) {
    console.error('Error marking modules as completed:', error);
    res.status(500).json({ success: false, message: 'Failed to mark modules as completed', error: error.message });
  }
}
