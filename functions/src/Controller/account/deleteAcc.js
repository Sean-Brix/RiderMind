import { findById, deleteDoc, getDb, COLLECTIONS, snapshotToArray } from '../../db/firestore.js';

export default async function deleteAcc(req, res) {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    if (!id) return res.status(400).json({ error: 'Invalid user ID' });
    if (id === currentUserId) return res.status(403).json({ error: 'You cannot delete your own account' });

    const userToDelete = await findById(COLLECTIONS.USERS, id);
    if (!userToDelete) return res.status(404).json({ error: 'User not found' });

    if (userToDelete.role === 'ADMIN') {
      const db = getDb();
      const adminSnapshot = await db.collection(COLLECTIONS.USERS).where('role', '==', 'ADMIN').get();
      if (adminSnapshot.size <= 1) {
        return res.status(403).json({ error: 'Cannot delete the last admin account' });
      }
    }

    await deleteDoc(COLLECTIONS.USERS, id);
    const displayName = [userToDelete.first_name, userToDelete.last_name].filter(Boolean).join(' ') || userToDelete.email;
    return res.json({ message: 'User account deleted successfully', deletedUser: { id, email: userToDelete.email, displayName } });
  } catch (err) {
    console.error('Delete user error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
