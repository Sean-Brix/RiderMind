/**
 * Video Upload and Streaming Utility
 * Handles video file uploads and serves them with streaming support
 */

import multer from 'multer';
import crypto from 'crypto';
import { deleteFile as deleteCloudFile } from './firebase.js';

/**
 * File filter for video uploads
 */
const videoFileFilter = (req, file, cb) => {
  const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg'];
  const maxSize = 100 * 1024 * 1024; // 100MB

  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Invalid video format. Only MP4, WebM, and OGG are allowed.'), false);
  }

  cb(null, true);
};

/**
 * Multer upload instance for videos
 */
// Use memory storage so we can stream buffer to Firebase
const uploadVideo = multer({
  storage: multer.memoryStorage(),
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

/**
 * Delete video file from filesystem
 * @param {string} videoPath - Relative path to video file
 */
async function deleteVideoFile(videoPath) {
  if (!videoPath) return;
  try {
    // Delegate deletion to Firebase utils
    await deleteCloudFile(videoPath);
  } catch (err) {
    console.error('Failed to delete cloud video:', videoPath, err);
  }
}

/**
 * Get video file info
 * @param {string} videoPath - Relative path to video file
 * @returns {Object|null}
 */
function getVideoInfo(/*videoPath*/) {
  // For cloud storage this is not available locally. Use firebase.getFileInfo instead when needed.
  return null;
}

/**
 * Stream video with range support
 * @param {string} videoPath - Relative path to video file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function streamVideo(/*videoPath, req, res*/) {
  // Streaming now handled by redirecting to cloud download URL in controller
  throw new Error('streamVideo is deprecated for cloud storage; use controller redirect to download URL');
}

/**
 * Get relative path for database storage
 * @param {string} filename - The video filename
 * @returns {string}
 */
function getRelativePath(filename) {
  return `/videos/${filename}`;
}

/**
 * Validate video file
 * @param {Object} file - Multer file object
 * @returns {boolean}
 */
function validateVideo(file) {
  const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg'];
  const maxSize = 100 * 1024 * 1024; // 100MB

  if (!allowedMimes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only MP4, WebM, and OGG are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 100MB.');
  }

  return true;
}

export {
  uploadVideo,
  deleteVideoFile,
  getVideoInfo,
  streamVideo,
  getRelativePath,
  validateVideo
};
