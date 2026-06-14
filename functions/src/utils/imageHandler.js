import sharp from 'sharp';
import multer from 'multer';
import path from 'path';

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

export async function processImageForStorage(fileBuffer, options = {}) {
  const { maxWidth = 1920, maxHeight = 1080, quality = 85, format = 'jpeg' } = options;
  const processedBuffer = await sharp(fileBuffer)
    .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
    [format]({ quality })
    .toBuffer();
  return {
    data: processedBuffer,
    mime: `image/${format === 'jpeg' ? 'jpeg' : format}`,
    size: processedBuffer.length,
  };
}

export function validateImage(file) {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024;
  if (!allowedMimes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
  }
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 10MB.');
  }
  return true;
}
