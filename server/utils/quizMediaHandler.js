/**
 * Quiz Media Upload and Streaming Utility
 * Handles video and image uploads for quiz questions
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Media storage directories
const QUIZ_VIDEO_DIR = path.join(__dirname, '..', 'public', 'quiz-videos');
const QUIZ_IMAGE_DIR = path.join(__dirname, '..', 'public', 'quiz-images');

// Ensure directories exist
if (!fs.existsSync(QUIZ_VIDEO_DIR)) {
  fs.mkdirSync(QUIZ_VIDEO_DIR, { recursive: true });
}

if (!fs.existsSync(QUIZ_IMAGE_DIR)) {
  fs.mkdirSync(QUIZ_IMAGE_DIR, { recursive: true });
}

/**
 * Multer storage configuration for quiz videos
 */
const quizVideoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, QUIZ_VIDEO_DIR);
  },
  filename: (req, file, cb) => {
    // Use question ID as filename for consistency: question-{questionId}.ext
    // This ensures the same question always has the same filename
    const ext = path.extname(file.originalname);
    const questionId = req.params.questionId || 'new';
    cb(null, `question-${questionId}${ext}`);
  }
});

/**
 * Multer memory storage for quiz images (store in database as BLOB)
 */
const quizImageStorage = multer.memoryStorage();

/**
 * File filter for video uploads
 */
const videoFileFilter = (req, file, cb) => {
  const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg'];

  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Invalid video format. Only MP4, WebM, and OGG are allowed.'), false);
  }

  cb(null, true);
};

/**
 * File filter for image uploads
 */
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Invalid image format. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
  }

  cb(null, true);
};

/**
 * Multer upload instance for quiz videos
 */
export const uploadQuizVideo = multer({
  storage: quizVideoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

/**
 * Multer upload instance for quiz images
 */
export const uploadQuizImage = multer({
  storage: quizImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/**
 * Delete quiz video file from filesystem
 * @param {string} videoPath - Relative path to video file
 */
export function deleteQuizVideoFile(videoPath) {
  if (!videoPath) return;
  
  const fullPath = path.join(__dirname, '..', 'public', videoPath);
  
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log(`Deleted quiz video: ${videoPath}`);
  }
}

/**
 * Get quiz video file info
 * @param {string} videoPath - Relative path to video file
 * @returns {Object|null}
 */
export function getQuizVideoInfo(videoPath) {
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
 * Stream quiz video with range support
 * @param {string} videoPath - Relative path to video file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export function streamQuizVideo(videoPath, req, res) {
  const fullPath = path.join(__dirname, '..', 'public', videoPath);
  
  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'Quiz video not found' });
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
export function getQuizVideoRelativePath(filename) {
  return `/quiz-videos/${filename}`;
}

/**
 * Validate quiz video file
 * @param {Object} file - Multer file object
 * @returns {boolean}
 */
export function validateQuizVideo(file) {
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

/**
 * Validate quiz image file
 * @param {Object} file - Multer file object
 * @returns {boolean}
 */
export function validateQuizImage(file) {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedMimes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 10MB.');
  }

  return true;
}

/**
 * Process image buffer for database storage
 * @param {Buffer} buffer - Image buffer from multer
 * @param {string} mimetype - Image MIME type
 * @returns {Object}
 */
export function processQuizImageForDB(buffer, mimetype) {
  return {
    imageData: buffer,
    imageMime: mimetype
  };
}

/**
 * Get image as base64 data URL
 * @param {Buffer} imageData - Image buffer from database
 * @param {string} imageMime - Image MIME type
 * @returns {string}
 */
export function getQuizImageDataURL(imageData, imageMime) {
  if (!imageData || !imageMime) return null;
  const base64 = imageData.toString('base64');
  return `data:${imageMime};base64,${base64}`;
}

export {
  QUIZ_VIDEO_DIR,
  QUIZ_IMAGE_DIR
};
