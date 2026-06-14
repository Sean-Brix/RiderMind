/**
 * Firebase Storage utility using Firebase Admin SDK.
 * Drop-in replacement for the old client-SDK firebase.js.
 */

import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

function getBucket() {
  return admin.storage().bucket();
}

/**
 * Upload a file buffer to Firebase Storage and return a permanent download URL.
 * @param {Buffer} fileBuffer
 * @param {string} storagePath  e.g. 'modules/123/slides/456/image.jpg'
 * @param {string} contentType  e.g. 'image/jpeg'
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadFile(fileBuffer, storagePath, contentType) {
  const bucket = getBucket();
  const file = bucket.file(storagePath);
  const downloadToken = uuidv4();

  await file.save(fileBuffer, {
    resumable: false,
    metadata: {
      contentType,
      metadata: {
        // This token is what Firebase Storage uses for the public download URL
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  });

  const bucketName = bucket.name;
  const encodedPath = encodeURIComponent(storagePath);
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${downloadToken}`;

  console.log(`✅ Uploaded: ${storagePath}`);
  return { url, path: storagePath };
}

/**
 * Delete a file from Firebase Storage.
 * @param {string} storagePath
 */
export async function deleteFile(storagePath) {
  if (!storagePath) return;
  try {
    const bucket = getBucket();
    await bucket.file(storagePath).delete();
    console.log(`🗑️ Deleted: ${storagePath}`);
  } catch (error) {
    if (error.code === 404) {
      console.log(`⚠️ File not found: ${storagePath}`);
    } else {
      console.error(`❌ Delete failed: ${storagePath}`, error);
      throw error;
    }
  }
}

/**
 * Generate a unique filename with a timestamp prefix.
 * @param {string} originalName
 * @returns {string}
 */
export function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const sanitized = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${timestamp}-${sanitized}`;
}

export default { uploadFile, deleteFile, generateUniqueFilename };
