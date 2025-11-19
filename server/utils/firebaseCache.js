/**
 * Simple in-memory cache for Firebase download URLs
 * Caches { path -> { url, expiresAt } } to avoid repeated getDownloadURL calls
 */
import { getFileUrl } from './firebase.js';

const cache = new Map();
// default TTL in ms (1 hour)
const DEFAULT_TTL = 1000 * 60 * 60;

export async function getFileUrlCached(path, ttl = DEFAULT_TTL) {
  if (!path) return null;

  const entry = cache.get(path);
  const now = Date.now();
  if (entry && entry.expiresAt > now) {
    return entry.url;
  }

  // Fetch fresh URL and cache it
  const url = await getFileUrl(path);
  cache.set(path, { url, expiresAt: now + ttl });
  return url;
}

export function clearFileCache(path) {
  if (path) cache.delete(path);
}

export function clearAllCache() {
  cache.clear();
}

export default {
  getFileUrlCached,
  clearFileCache,
  clearAllCache
};
