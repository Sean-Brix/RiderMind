/**
 * Image Utility for handling LONGBLOB storage
 * Handles image upload, compression, and retrieval
 */

import sharp from 'sharp';
import multer from 'multer';
import path from 'path';

/**
 * Multer memory storage for images (store in memory, not disk)
 * We'll read from memory and save directly to MySQL LONGBLOB
 */
const imageStorage = multer.memoryStorage();

/**
 * File filter to accept only images
 */
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

/**
 * Multer upload instance for images
 * Stores in memory for direct database insertion
 */
export const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: imageFilter
});

/**
 * Process and compress image for LONGBLOB storage
 * @param {Buffer} fileBuffer - The uploaded file buffer
 * @param {Object} options - Processing options
 * @returns {Promise<{data: Buffer, mime: string}>}
 */
export async function processImageForStorage(fileBuffer, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 85,
    format = 'jpeg' // Can be 'jpeg', 'png', 'webp'
  } = options;

  try {
    // Process image with sharp
    const processedBuffer = await sharp(fileBuffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      [format]({ quality })
      .toBuffer();

    const mimeType = `image/${format === 'jpeg' ? 'jpeg' : format}`;

    return {
      data: processedBuffer,
      mime: mimeType,
      size: processedBuffer.length
    };
  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
}

/**
 * Convert image buffer to base64 for client response
 * @param {Buffer} imageData - The image buffer from database
 * @param {string} mimeType - The MIME type
 * @returns {string} Base64 data URL
 */
export function bufferToBase64(imageData, mimeType) {
  if (!imageData) return null;
  const base64 = imageData.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Validate image file
 * @param {Object} file - Multer file object
 * @returns {boolean}
 */
export function validateImage(file) {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
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
 * Create thumbnail from image
 * @param {Buffer} fileBuffer - The uploaded file buffer
 * @returns {Promise<{data: Buffer, mime: string}>}
 */
export async function createThumbnail(fileBuffer) {
  try {
    const thumbnailBuffer = await sharp(fileBuffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    return {
      data: thumbnailBuffer,
      mime: 'image/jpeg',
      size: thumbnailBuffer.length
    };
  } catch (error) {
    throw new Error(`Thumbnail creation failed: ${error.message}`);
  }
}

/**
 * Get image metadata
 * @param {Buffer} fileBuffer - The image buffer
 * @returns {Promise<Object>}
 */
export async function getImageMetadata(fileBuffer) {
  try {
    const metadata = await sharp(fileBuffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      space: metadata.space,
      channels: metadata.channels,
      hasAlpha: metadata.hasAlpha
    };
  } catch (error) {
    throw new Error(`Failed to get image metadata: ${error.message}`);
  }
}
