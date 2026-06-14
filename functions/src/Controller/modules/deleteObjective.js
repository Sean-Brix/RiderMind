import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';

export default async function deleteObjective(req, res) {
  try {
    const { objectiveId } = req.params;
    const db = getDb();

    const existDoc = await db.collection(COLLECTIONS.MODULE_OBJECTIVES).doc(objectiveId).get();
    if (!docToObject(existDoc)) return res.status(404).json({ success: false, error: 'Objective not found' });

    await db.collection(COLLECTIONS.MODULE_OBJECTIVES).doc(objectiveId).delete();
    res.status(200).json({ success: true, message: 'Objective deleted successfully' });
  } catch (error) {
    console.error('Error deleting objective:', error);
    res.status(500).json({ success: false, error: 'Failed to delete objective', message: error.message });
  }
}
