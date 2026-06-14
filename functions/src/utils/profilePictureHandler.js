import multer from 'multer';
import { uploadFile, deleteFile } from './storage.js';

const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

export const uploadProfilePicture = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

export async function uploadProfilePictureToFirebase(fileBuffer, userId, mimetype) {
  const ext = mimetype.split('/')[1];
  const filename = `user-${userId}.${ext}`;
  const storagePath = `profile-pictures/${filename}`;
  const result = await uploadFile(fileBuffer, storagePath, mimetype);
  return result.url;
}

export async function deleteProfilePictureFromFirebase(userId) {
  const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  for (const ext of extensions) {
    const storagePath = `profile-pictures/user-${userId}.${ext}`;
    try {
      await deleteFile(storagePath);
    } catch (error) {
      if (error.code !== 404) {
        console.error(`Error deleting ${storagePath}:`, error);
      }
    }
  }
}
