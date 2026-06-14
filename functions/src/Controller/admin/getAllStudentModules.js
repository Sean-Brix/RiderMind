import { getDb, COLLECTIONS, snapshotToArray, docToObject } from '../../db/firestore.js';

export default async function getAllStudentModules(req, res) {
  try {
    const { page = 1, limit = 20, userId, categoryId, status, search } = req.query;
    const db = getDb();

    let query = db.collection(COLLECTIONS.STUDENT_MODULES);
    if (userId) query = query.where('userId', '==', userId);
    if (categoryId) query = query.where('categoryId', '==', categoryId);
    if (status) query = query.where('status', '==', status);

    const snap = await query.get();
    let studentModules = snapshotToArray(snap).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (search) {
      const s = search.toLowerCase();
      studentModules = studentModules.filter(sm => sm.id.toLowerCase().includes(s));
    }

    const pageNum = parseInt(page);
    const pageSize = parseInt(limit);
    const paginated = studentModules.slice((pageNum - 1) * pageSize, pageNum * pageSize);

    const enriched = await Promise.all(paginated.map(async sm => {
      const [userDoc, modDoc, catDoc] = await Promise.all([
        db.collection(COLLECTIONS.USERS).doc(sm.userId).get(),
        db.collection(COLLECTIONS.MODULES).doc(sm.moduleId).get(),
        db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(sm.categoryId).get(),
      ]);
      const u = docToObject(userDoc);
      return { ...sm, user: u ? { id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email } : null, module: docToObject(modDoc) ? { id: docToObject(modDoc).id, title: docToObject(modDoc).title } : null, category: docToObject(catDoc) ? { id: docToObject(catDoc).id, name: docToObject(catDoc).name } : null };
    }));

    res.status(200).json({ success: true, data: enriched, pagination: { total: studentModules.length, page: pageNum, limit: pageSize, totalPages: Math.ceil(studentModules.length / pageSize) } });
  } catch (error) {
    console.error('Error fetching student modules:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch student modules', message: error.message });
  }
}
