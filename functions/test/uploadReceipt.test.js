import assert from 'node:assert/strict';
import test from 'node:test';
import { parseReceiptUpload } from '../src/Controller/Authentication/uploadReceipt.js';

function multipartReceipt(boundary) {
  return Buffer.from([
    `--${boundary}\r\n`,
    'Content-Disposition: form-data; name="receipt"; filename="receipt.png"\r\n',
    'Content-Type: image/png\r\n\r\n',
    'PNGDATA\r\n',
    `--${boundary}\r\n`,
    'Content-Disposition: form-data; name="orNumber"\r\n\r\n',
    'OR-TEST-001\r\n',
    `--${boundary}--\r\n`,
  ].join(''));
}

test('replays Firebase rawBody for Multer receipt parsing', async () => {
  const boundary = '----RiderMindBoundary';
  const rawBody = multipartReceipt(boundary);
  const req = {
    rawBody,
    headers: {
      'content-type': `multipart/form-data; boundary=${boundary}`,
      'content-length': String(rawBody.length),
    },
    method: 'POST',
    url: '/upload-receipt',
    originalUrl: '/api/auth/registration-requests/request-id/upload-receipt',
    body: {},
  };

  await new Promise((resolve, reject) => {
    parseReceiptUpload(req, {}, error => error ? reject(error) : resolve());
  });

  assert.equal(req.file.originalname, 'receipt.png');
  assert.equal(req.file.mimetype, 'image/png');
  assert.equal(req.file.buffer.toString(), 'PNGDATA');
  assert.equal(req.body.orNumber, 'OR-TEST-001');
});
