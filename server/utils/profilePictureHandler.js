/**
 * Profile Picture Upload Utility - Firebase Storage
 * Handles profile picture uploads and deletion using Firebase
 */

import multer from 'multer';
import path from 'path';
import { uploadFile, deleteFile } from './firebase.js';

/**
 * File filter for profile picture uploads
 * Only allow common image formats
 */
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

/**
 * Multer upload instance for profile pictures - memory storage for Firebase
 * - Max file size: 5MB
 * - Only image files allowed
 */
export const uploadProfilePicture = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFileFilter,
});

/**
 * Upload profile picture to Firebase Storage
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {number} userId - User ID
 * @param {string} mimetype - File MIME type
 * @returns {Promise<string>} Firebase download URL
 */
export async function uploadProfilePictureToFirebase(fileBuffer, userId, mimetype) {
  const ext = mimetype.split('/')[1]; // jpeg, png, gif, webp
  const filename = `user-${userId}.${ext}`;
  const storagePath = `profile-pictures/${filename}`;
  
  const result = await uploadFile(fileBuffer, storagePath, mimetype);
  return result.url;
}

/**
 * Delete profile picture from Firebase Storage
 * @param {number} userId - User ID
 * @returns {Promise<void>}
 */
export async function deleteProfilePictureFromFirebase(userId) {
  // Try to delete common image formats
  const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  
  for (const ext of extensions) {
    const filename = `user-${userId}.${ext}`;
    const storagePath = `profile-pictures/${filename}`;
    
    try {
      await deleteFile(storagePath);
    } catch (error) {
      // Ignore if file doesn't exist
      if (error.code !== 'storage/object-not-found') {
        console.error(`Error deleting ${storagePath}:`, error);
      }
    }
  }
}
