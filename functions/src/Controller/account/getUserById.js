import { findById, COLLECTIONS } from '../../db/firestore.js';

export default async function getUserById(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Invalid id' });

    const authenticatedUserId = req.user.id;
    if (authenticatedUserId !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to access this profile' });
    }

    const user = await findById(COLLECTIONS.USERS, id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('Get user by id error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
