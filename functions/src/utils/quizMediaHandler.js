import multer from 'multer';
import path from 'path';

const videoFileFilter = (req, file, cb) => {
  const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg'];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Invalid video format. Only MP4, WebM, and OGG are allowed.'), false);
  }
  cb(null, true);
};

const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Invalid image format. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
  }
  cb(null, true);
};

export const uploadQuizVideo = multer({
  storage: multer.memoryStorage(),
  fileFilter: videoFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
}).single('video');

export const uploadQuizImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('image');

export function validateQuizVideo(file) {
  const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg'];
  const maxSize = 100 * 1024 * 1024;
  if (!allowedMimes.includes(file.mimetype)) throw new Error('Invalid file type. Only MP4, WebM, and OGG are allowed.');
  if (file.size > maxSize) throw new Error('File too large. Maximum size is 100MB.');
  return true;
}

export function validateQuizImage(file) {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024;
  if (!allowedMimes.includes(file.mimetype)) throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
  if (file.size > maxSize) throw new Error('File too large. Maximum size is 10MB.');
  return true;
}
