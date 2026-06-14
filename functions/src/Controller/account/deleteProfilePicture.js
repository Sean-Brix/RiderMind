import { updateDoc, COLLECTIONS } from '../../db/firestore.js';
import { deleteProfilePictureFromFirebase } from '../../utils/profilePictureHandler.js';

export default async function deleteProfilePictureController(req, res) {
  try {
    const { id } = req.params;
    const authenticatedUserId = req.user.id;

    if (authenticatedUserId !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete profile picture for this user' });
    }

    await deleteProfilePictureFromFirebase(id);
    await updateDoc(COLLECTIONS.USERS, id, { profilePictureUrl: null });
    res.json({ message: 'Profile picture deleted successfully', user: { id, profilePictureUrl: null } });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({ error: 'Failed to delete profile picture' });
  }
}
