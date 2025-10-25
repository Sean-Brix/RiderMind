/**
 * Video Upload and Streaming Utility
 * Handles video file uploads and serves them with streaming support
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Video storage directory
const VIDEO_DIR = path.join(__dirname, '..', 'public', 'videos');

// Ensure video directory exists
if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

/**
 * Multer storage configuration for videos
 */
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, VIDEO_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random hash
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  }
});

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
const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

/**
 * Delete video file from filesystem
 * @param {string} videoPath - Relative path to video file
 */
function deleteVideoFile(videoPath) {
  if (!videoPath) return;
  
  const fullPath = path.join(__dirname, '..', 'public', videoPath);
  
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

/**
 * Get video file info
 * @param {string} videoPath - Relative path to video file
 * @returns {Object|null}
 */
function getVideoInfo(videoPath) {
  if (!videoPath) return null;
  
  const fullPath = path.join(__dirname, '..', 'public', videoPath);
  
  if (!fs.existsSync(fullPath)) return null;
  
  const stats = fs.statSync(fullPath);
  
  return {
    size: stats.size,
    exists: true,
    path: videoPath,
    fullPath: fullPath
  };
}

/**
 * Stream video with range support
 * @param {string} videoPath - Relative path to video file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function streamVideo(videoPath, req, res) {
  const fullPath = path.join(__dirname, '..', 'public', videoPath);
  
  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const stat = fs.statSync(fullPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // Parse range header
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    
    const file = fs.createReadStream(fullPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    // No range request, send entire file
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    
    res.writeHead(200, head);
    fs.createReadStream(fullPath).pipe(res);
  }
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

module.exports = {
  uploadVideo,
  deleteVideoFile,
  getVideoInfo,
  streamVideo,
  getRelativePath,
  validateVideo,
  VIDEO_DIR
};
