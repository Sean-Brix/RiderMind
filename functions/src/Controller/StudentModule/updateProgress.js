import { getDb, COLLECTIONS, snapshotToArray, docToObject, updateDoc } from '../../db/firestore.js';

export default async function updateProgress(req, res) {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;
    const { currentSlideId, progress, categoryId } = req.body;
    const db = getDb();

    if (!categoryId) return res.status(400).json({ success: false, error: 'categoryId is required' });

    const smSnap = await db.collection(COLLECTIONS.STUDENT_MODULES)
      .where('userId', '==', userId).where('moduleId', '==', moduleId).where('categoryId', '==', categoryId).limit(1).get();

    if (smSnap.empty) return res.status(404).json({ success: false, error: 'Student module not found' });

    const sm = { id: smSnap.docs[0].id, ...smSnap.docs[0].data() };
    const data = {};

    if (currentSlideId !== undefined) data.currentSlideId = currentSlideId;
    if (progress !== undefined) {
      data.progress = Math.min(100, Math.max(0, parseFloat(progress)));
      if (data.progress >= 100 && sm.status === 'ONGOING') {
        data.status = 'COMPLETED';
        data.isCompleted = true;
        data.completedAt = new Date().toISOString();
      }
    }
    if (!sm.startedAt) data.startedAt = new Date().toISOString();

    await updateDoc(COLLECTIONS.STUDENT_MODULES, sm.id, data);
    const updated = docToObject(await db.collection(COLLECTIONS.STUDENT_MODULES).doc(sm.id).get());

    const modDoc = await db.collection(COLLECTIONS.MODULES).doc(moduleId).get();
    const mod = docToObject(modDoc);
    let module = null;
    if (mod) {
      const [objSnap, slideSnap] = await Promise.all([
        db.collection(COLLECTIONS.MODULE_OBJECTIVES).where('moduleId', '==', moduleId).get(),
        db.collection(COLLECTIONS.MODULE_SLIDES).where('moduleId', '==', moduleId).orderBy('position', 'asc').get(),
      ]);
      module = { ...mod, objectives: snapshotToArray(objSnap), slides: snapshotToArray(slideSnap).map(({ content: _, ...s }) => s) };
    }

    res.status(200).json({ success: true, data: { ...updated, module } });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ success: false, error: 'Failed to update progress', message: error.message });
  }
}
