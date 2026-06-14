import { updateDoc, COLLECTIONS } from '../../db/firestore.js';
import { uploadProfilePictureToFirebase, deleteProfilePictureFromFirebase } from '../../utils/profilePictureHandler.js';

export default async function uploadProfilePictureController(req, res) {
  try {
    const { id } = req.params;
    const authenticatedUserId = req.user.id;

    if (authenticatedUserId !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to upload profile picture for this user' });
    }
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    await deleteProfilePictureFromFirebase(id);
    const profilePictureUrl = await uploadProfilePictureToFirebase(req.file.buffer, id, req.file.mimetype);
    await updateDoc(COLLECTIONS.USERS, id, { profilePictureUrl });

    res.json({ message: 'Profile picture uploaded successfully', user: { id, profilePictureUrl } });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
}
