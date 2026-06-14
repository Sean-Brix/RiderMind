import { getDb, COLLECTIONS, snapshotToArray } from '../../db/firestore.js';

export default async function getAllUser(req, res) {
  try {
    const db = getDb();
    const snapshot = await db.collection(COLLECTIONS.USERS).orderBy('createdAt', 'desc').get();
    const users = snapshotToArray(snapshot).map(u => ({
      id: u.id, email: u.email, role: u.role,
      first_name: u.first_name, last_name: u.last_name, name_extension: u.name_extension,
      createdAt: u.createdAt, updatedAt: u.updatedAt,
      displayName: [u.first_name, u.last_name, u.name_extension].filter(Boolean).join(' ') || u.email,
    }));
    return res.json({ users });
  } catch (err) {
    console.error('Get all users error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
