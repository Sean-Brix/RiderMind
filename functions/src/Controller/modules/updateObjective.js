import { getDb, COLLECTIONS, docToObject, updateDoc } from '../../db/firestore.js';

export default async function updateObjective(req, res) {
  try {
    const { objectiveId } = req.params;
    const { objective, position } = req.body;
    const db = getDb();

    const existDoc = await db.collection(COLLECTIONS.MODULE_OBJECTIVES).doc(objectiveId).get();
    if (!docToObject(existDoc)) return res.status(404).json({ success: false, error: 'Objective not found' });

    const data = {};
    if (objective !== undefined) data.objective = objective;
    if (position !== undefined) data.position = position;

    await updateDoc(COLLECTIONS.MODULE_OBJECTIVES, objectiveId, data);
    const updated = docToObject(await db.collection(COLLECTIONS.MODULE_OBJECTIVES).doc(objectiveId).get());

    res.status(200).json({ success: true, message: 'Objective updated successfully', data: updated });
  } catch (error) {
    console.error('Error updating objective:', error);
    res.status(500).json({ success: false, error: 'Failed to update objective', message: error.message });
  }
}
