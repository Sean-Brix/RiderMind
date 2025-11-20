/**
 * Delete Profile Picture Controller
 * Handles profile picture deletion for authenticated users
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { deleteProfilePictureFromFirebase } from '../../utils/profilePictureHandler.js';

export default async function deleteProfilePictureController(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const authenticatedUserId = req.user.id;

    // Only allow users to delete their own profile picture (or admins)
    if (authenticatedUserId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete profile picture for this user' });
    }

    // Delete profile picture from Firebase Storage
    await deleteProfilePictureFromFirebase(userId);

    // Update user in database to remove profilePictureUrl
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePictureUrl: null },
      select: {
        id: true,
        email: true,
        role: true,
        first_name: true,
        middle_name: true,
        last_name: true,
        profilePictureUrl: true,
      },
    });

    res.json({
      message: 'Profile picture deleted successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({ error: 'Failed to delete profile picture' });
  }
}
