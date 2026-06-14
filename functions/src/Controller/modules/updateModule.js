import { getDb, COLLECTIONS, docToObject, updateDoc, findOne, snapshotToArray } from '../../db/firestore.js';

export default async function updateModule(req, res) {
  try {
    const { id } = req.params;
    const { title, description, isActive, position, objectives, slides } = req.body;
    const db = getDb();

    const existingDoc = await db.collection(COLLECTIONS.MODULES).doc(id).get();
    const existing = docToObject(existingDoc);
    if (!existing) return res.status(404).json({ success: false, error: 'Module not found' });

    if (title && title !== existing.title) {
      const dup = await findOne(COLLECTIONS.MODULES, 'title', title);
      if (dup && dup.id !== id) return res.status(409).json({ success: false, error: 'Module with this title already exists' });
    }

    const updateData = { updatedBy: req.user?.id || null };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (position !== undefined) updateData.position = position;

    await updateDoc(COLLECTIONS.MODULES, id, updateData);

    const ts = new Date().toISOString();
    const batch = db.batch();

    if (objectives && Array.isArray(objectives)) {
      const objSnap = await db.collection(COLLECTIONS.MODULE_OBJECTIVES).where('moduleId', '==', id).get();
      objSnap.docs.forEach(d => batch.delete(d.ref));
      objectives.forEach((obj, index) => {
        const ref = db.collection(COLLECTIONS.MODULE_OBJECTIVES).doc();
        batch.set(ref, { moduleId: id, objective: typeof obj === 'string' ? obj : obj.objective, position: obj.position || index + 1, createdAt: ts, updatedAt: ts });
      });
    }

    await batch.commit();

    const [objSnap, slideSnap] = await Promise.all([
      db.collection(COLLECTIONS.MODULE_OBJECTIVES).where('moduleId', '==', id).orderBy('position', 'asc').get(),
      db.collection(COLLECTIONS.MODULE_SLIDES).where('moduleId', '==', id).orderBy('position', 'asc').get(),
    ]);

    const updatedMod = docToObject(await db.collection(COLLECTIONS.MODULES).doc(id).get());
    res.status(200).json({ success: true, message: 'Module updated successfully', data: { ...updatedMod, objectives: snapshotToArray(objSnap), slides: snapshotToArray(slideSnap) } });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ success: false, error: 'Failed to update module', message: error.message });
  }
}
