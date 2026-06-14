import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function getStudentModuleById(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();

    const smDoc = await db.collection(COLLECTIONS.STUDENT_MODULES).doc(id).get();
    const sm = docToObject(smDoc);
    if (!sm) return res.status(404).json({ success: false, error: 'Student module not found' });

    const [userDoc, modDoc, catDoc] = await Promise.all([
      db.collection(COLLECTIONS.USERS).doc(sm.userId).get(),
      db.collection(COLLECTIONS.MODULES).doc(sm.moduleId).get(),
      db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(sm.categoryId).get(),
    ]);

    const mod = docToObject(modDoc);
    let module = null;
    if (mod) {
      const [objSnap, slideSnap] = await Promise.all([
        db.collection(COLLECTIONS.MODULE_OBJECTIVES).where('moduleId', '==', sm.moduleId).orderBy('position', 'asc').get(),
        db.collection(COLLECTIONS.MODULE_SLIDES).where('moduleId', '==', sm.moduleId).orderBy('position', 'asc').get(),
      ]);
      module = { ...mod, objectives: snapshotToArray(objSnap), slides: snapshotToArray(slideSnap).map(({ content: _, ...s }) => s) };
    }

    const u = docToObject(userDoc);
    res.status(200).json({ success: true, data: { ...sm, user: u ? { id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, profilePicture: u.profilePicture } : null, module, category: docToObject(catDoc) } });
  } catch (error) {
    console.error('Error fetching student module:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch student module', message: error.message });
  }
}
