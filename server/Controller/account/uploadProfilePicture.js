/**
 * Upload Profile Picture Controller
 * Handles profile picture upload for authenticated users
 */

import { PrismaClient } from '@prisma/client';
import { uploadProfilePictureToFirebase, deleteProfilePictureFromFirebase } from '../../utils/profilePictureHandler.js';

const prisma = new PrismaClient();

export default async function uploadProfilePictureController(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const authenticatedUserId = req.user.id;

    // Only allow users to upload their own profile picture (or admins)
    if (authenticatedUserId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to upload profile picture for this user' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Delete existing profile picture from Firebase before uploading new one
    await deleteProfilePictureFromFirebase(userId);

    // Upload to Firebase Storage
    const profilePictureUrl = await uploadProfilePictureToFirebase(
      req.file.buffer,
      userId,
      req.file.mimetype
    );

    // Update user in database with Firebase URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePictureUrl },
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
      message: 'Profile picture uploaded successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
}
