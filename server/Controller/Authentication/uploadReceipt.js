import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import { uploadFile } from '../../utils/firebase.js';

const prisma = new PrismaClient();

// Configure multer to store files in memory for Firebase upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images and PDFs only
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

/**
 * POST /api/auth/registration-requests/:id/upload-receipt
 * Upload payment receipt for registration approval to Firebase Storage
 */
export async function uploadReceipt(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No receipt file uploaded'
      });
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'receipt-' + uniqueSuffix + path.extname(req.file.originalname);
    const storagePath = `receipts/${filename}`;

    // Upload to Firebase Storage
    const result = await uploadFile(req.file.buffer, storagePath, req.file.mimetype);

    res.status(200).json({
      success: true,
      message: 'Receipt uploaded successfully to Firebase Storage',
      receiptUrl: result.url,
      filename: filename
    });

  } catch (error) {
    console.error('Upload receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload receipt',
      error: error.message
    });
  }
}
