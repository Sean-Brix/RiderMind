/**
 * Firebase Storage Utility Functions
 * 
 * Ready-to-use helper functions for Firebase Storage operations.
 * Import these functions when you need to upload, delete, or manage files.
 */

import { storage } from '../firebase.config.js';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll,
  getMetadata
} from 'firebase/storage';

/**
 * Upload a file to Firebase Storage
 * 
 * @param {Buffer} fileBuffer - File buffer from multer (req.file.buffer)
 * @param {string} path - Storage path (e.g., 'videos/quiz-video-123.mp4')
 * @param {string} contentType - MIME type (e.g., 'video/mp4', 'image/jpeg')
 * @returns {Promise<{url: string, path: string}>} Download URL and storage path
 * 
 * @example
 * const result = await uploadFile(req.file.buffer, 'videos/my-video.mp4', 'video/mp4');
 * console.log(result.url); // https://firebasestorage.googleapis.com/...
 */
export async function uploadFile(fileBuffer, path, contentType) {
  try {
    const storageRef = ref(storage, path);
    const metadata = { contentType };
    
    await uploadBytes(storageRef, fileBuffer, metadata);
    const url = await getDownloadURL(storageRef);
    
    console.log(`✅ Uploaded: ${path}`);
    return { url, path };
  } catch (error) {
    console.error(`❌ Upload failed: ${path}`, error);
    throw error;
  }
}

/**
 * Delete a file from Firebase Storage
 * 
 * @param {string} path - Storage path to delete
 * @returns {Promise<void>}
 * 
 * @example
 * await deleteFile('videos/old-video.mp4');
 */
export async function deleteFile(path) {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    console.log(`🗑️ Deleted: ${path}`);
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      console.log(`⚠️ File not found: ${path}`);
    } else {
      console.error(`❌ Delete failed: ${path}`, error);
      throw error;
    }
  }
}

/**
 * Get the download URL for a file
 * 
 * @param {string} path - Storage path
 * @returns {Promise<string>} Download URL
 * 
 * @example
 * const url = await getFileUrl('videos/my-video.mp4');
 */
export async function getFileUrl(path) {
  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error(`❌ Get URL failed: ${path}`, error);
    throw error;
  }
}

/**
 * List all files in a folder
 * 
 * @param {string} folderPath - Folder path (e.g., 'videos/')
 * @returns {Promise<Array<{name: string, fullPath: string}>>} Array of file info
 * 
 * @example
 * const files = await listFiles('videos/');
 */
export async function listFiles(folderPath) {
  try {
    const storageRef = ref(storage, folderPath);
    const result = await listAll(storageRef);
    
    return result.items.map(item => ({
      name: item.name,
      fullPath: item.fullPath
    }));
  } catch (error) {
    console.error(`❌ List failed: ${folderPath}`, error);
    throw error;
  }
}

/**
 * Get file metadata (size, type, creation date, etc.)
 * 
 * @param {string} path - Storage path
 * @returns {Promise<object>} File metadata
 * 
 * @example
 * const meta = await getFileInfo('videos/my-video.mp4');
 * console.log(meta.size, meta.contentType);
 */
export async function getFileInfo(path) {
  try {
    const storageRef = ref(storage, path);
    const metadata = await getMetadata(storageRef);
    return metadata;
  } catch (error) {
    console.error(`❌ Get metadata failed: ${path}`, error);
    throw error;
  }
}

/**
 * Generate a unique filename with timestamp
 * 
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename
 * 
 * @example
 * const name = generateUniqueFilename('video.mp4');
 * // Returns: '1700000000000-video.mp4'
 */
export function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const sanitized = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${timestamp}-${sanitized}`;
}

// Export all functions
export default {
  uploadFile,
  deleteFile,
  getFileUrl,
  listFiles,
  getFileInfo,
  generateUniqueFilename
};
