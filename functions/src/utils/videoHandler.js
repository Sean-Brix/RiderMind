import multer from 'multer';
import { deleteFile as deleteCloudFile } from './storage.js';

const videoFileFilter = (req, file, cb) => {
  const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg'];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Invalid video format. Only MP4, WebM, and OGG are allowed.'), false);
  }
  cb(null, true);
};

export const uploadVideo = multer({
  storage: multer.memoryStorage(),
  fileFilter: videoFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

export async function deleteVideoFile(videoPath) {
  if (!videoPath) return;
  try {
    await deleteCloudFile(videoPath);
  } catch (err) {
    console.error('Failed to delete cloud video:', videoPath, err);
  }
}

export function validateVideo(file) {
  const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg'];
  const maxSize = 100 * 1024 * 1024;
  if (!allowedMimes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only MP4, WebM, and OGG are allowed.');
  }
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 100MB.');
  }
  return true;
}
