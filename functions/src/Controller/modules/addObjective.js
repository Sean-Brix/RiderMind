import { getDb, COLLECTIONS, docToObject, createDoc } from '../../db/firestore.js';

export default async function addObjective(req, res) {
  try {
    const { moduleId } = req.params;
    const { objective, position } = req.body;

    if (!objective) return res.status(400).json({ success: false, error: 'Objective text is required' });

    const db = getDb();
    const modDoc = await db.collection(COLLECTIONS.MODULES).doc(moduleId).get();
    if (!docToObject(modDoc)) return res.status(404).json({ success: false, error: 'Module not found' });

    const newObjective = await createDoc(COLLECTIONS.MODULE_OBJECTIVES, {
      moduleId, objective, position: position || 0,
    });

    res.status(201).json({ success: true, message: 'Objective added successfully', data: newObjective });
  } catch (error) {
    console.error('Error adding objective:', error);
    res.status(500).json({ success: false, error: 'Failed to add objective', message: error.message });
  }
}
