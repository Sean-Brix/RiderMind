import { getDb, COLLECTIONS } from '../../db/firestore.js';

async function deleteCollection(db, collectionName, field, value) {
  const snap = await db.collection(collectionName).where(field, '==', value).get();
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  if (!snap.empty) await batch.commit();
  return snap.size;
}

export default async function clearAllModules(req, res) {
  try {
    const db = getDb();
    const modSnap = await db.collection(COLLECTIONS.MODULES).get();
    if (modSnap.empty) return res.status(400).json({ success: false, error: 'No modules to clear' });

    const moduleIds = modSnap.docs.map(d => d.id);
    let totalDeleted = 0;

    for (const moduleId of moduleIds) {
      const [slides, objectives, quizSnap] = await Promise.all([
        deleteCollection(db, COLLECTIONS.MODULE_SLIDES, 'moduleId', moduleId),
        deleteCollection(db, COLLECTIONS.MODULE_OBJECTIVES, 'moduleId', moduleId),
        db.collection(COLLECTIONS.QUIZZES).where('moduleId', '==', moduleId).get(),
      ]);
      totalDeleted += slides + objectives;

      for (const quizDoc of quizSnap.docs) {
        const [questions, attempts] = await Promise.all([
          deleteCollection(db, COLLECTIONS.QUIZ_QUESTIONS, 'quizId', quizDoc.id),
          deleteCollection(db, COLLECTIONS.QUIZ_ATTEMPTS, 'quizId', quizDoc.id),
        ]);
        totalDeleted += questions + attempts;
        await quizDoc.ref.delete();
        totalDeleted++;
      }
    }

    const batch = db.batch();
    modSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    totalDeleted += moduleIds.length;

    res.status(200).json({ success: true, message: 'All modules cleared successfully', data: { modulesDeleted: moduleIds.length, totalDocumentsDeleted: totalDeleted } });
  } catch (error) {
    console.error('Error clearing modules:', error);
    res.status(500).json({ success: false, error: 'Failed to clear modules', details: error.message });
  }
}
