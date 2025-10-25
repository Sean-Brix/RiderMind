/**
 * Image Utility for handling LONGBLOB storage
 * Handles image upload, compression, and retrieval
 */

const sharp = require('sharp');

/**
 * Process and compress image for LONGBLOB storage
 * @param {Buffer} fileBuffer - The uploaded file buffer
 * @param {Object} options - Processing options
 * @returns {Promise<{data: Buffer, mime: string}>}
 */
async function processImageForStorage(fileBuffer, options = {}) {
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
function bufferToBase64(imageData, mimeType) {
  if (!imageData) return null;
  const base64 = imageData.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Validate image file
 * @param {Object} file - Multer file object
 * @returns {boolean}
 */
function validateImage(file) {
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
async function createThumbnail(fileBuffer) {
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
async function getImageMetadata(fileBuffer) {
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

module.exports = {
  processImageForStorage,
  bufferToBase64,
  validateImage,
  createThumbnail,
  getImageMetadata
};
