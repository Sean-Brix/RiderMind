import multer from 'multer';
import path from 'path';
import { Readable } from 'node:stream';
import { uploadFile } from '../../utils/storage.js';

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) cb(null, true);
  else cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
};

export const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

export function parseReceiptUpload(req, res, next) {
  const contentType = req.headers['content-type'] || '';
  const isBufferedMultipart =
    Buffer.isBuffer(req.rawBody) &&
    contentType.toLowerCase().startsWith('multipart/form-data');

  if (!isBufferedMultipart) {
    return upload.single('receipt')(req, res, next);
  }

  const replayedRequest = Readable.from(req.rawBody);
  replayedRequest.headers = req.headers;
  replayedRequest.method = req.method;
  replayedRequest.url = req.url;
  replayedRequest.originalUrl = req.originalUrl;

  return upload.single('receipt')(replayedRequest, res, error => {
    if (!error) {
      req.file = replayedRequest.file;
      req.body = {
        ...(req.body || {}),
        ...(replayedRequest.body || {}),
      };
    }
    next(error);
  });
}

export async function uploadReceipt(req, res) {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ success: false, message: 'No receipt file uploaded' });

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'receipt-' + uniqueSuffix + path.extname(req.file.originalname);
    const storagePath = `receipts/${filename}`;
    const result = await uploadFile(req.file.buffer, storagePath, req.file.mimetype);

    res.status(200).json({
      success: true, message: 'Receipt uploaded successfully',
      receiptUrl: result.url, filename,
    });
  } catch (error) {
    console.error('Upload receipt error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload receipt', error: error.message });
  }
}
