import { useState } from 'react';
import { motion } from 'framer-motion';

function ModuleFirebaseTest() {
  const [slideId, setSlideId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('image'); // 'video' or 'image'
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fetchedUrl, setFetchedUrl] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
      setError('');
      
      // Auto-detect file type
      if (file.type.startsWith('video/')) {
        setFileType('video');
      } else if (file.type.startsWith('image/')) {
        setFileType('image');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !slideId) {
      setError('Please select a file and enter a slide ID');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append(fileType, selectedFile);

      const token = localStorage.getItem('token');
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const endpoint = fileType === 'video' 
        ? `/api/modules/slides/${slideId}/video`
        : `/api/modules/slides/${slideId}/image`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (response.ok) {
        setUploadResult(data);
        setError('');
      } else {
        setError(data.error || 'Upload failed');
        setUploadResult(null);
      }
    } catch (err) {
      setError('Network error: ' + err.message);
      setUploadResult(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFetchMedia = async () => {
    if (!slideId) {
      setError('Please enter a slide ID');
      return;
    }

    setError('');
    setFetchedUrl(null);

    try {
      const token = localStorage.getItem('token');
      
      const endpoint = fileType === 'video' 
        ? `/api/modules/slides/${slideId}/video`
        : `/api/modules/slides/${slideId}/image`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        redirect: 'manual' // Don't follow redirects automatically
      });

      if (response.type === 'opaqueredirect' || response.status === 302) {
        // Extract the redirect URL
        const redirectUrl = response.headers.get('Location') || response.url;
        setFetchedUrl(redirectUrl);
        
        // Cache in localStorage for client-side caching
        const cacheKey = `media_cache_${fileType}_${slideId}`;
        localStorage.setItem(cacheKey, JSON.stringify({
          url: redirectUrl,
          timestamp: Date.now(),
          type: fileType
        }));
      } else {
        setError('Failed to fetch media URL');
      }
    } catch (err) {
      setError('Fetch error: ' + err.message);
    }
  };

  const handleClearTest = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setError('');
    setUploadProgress(0);
    setFetchedUrl(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            📚 Module Slide Firebase Test
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Upload images/videos to module slides using Firebase Storage
          </p>
        </div>
        <div className="text-4xl">🎥</div>
      </div>

      {/* Slide ID Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          Slide ID
        </label>
        <input
          type="number"
          value={slideId}
          onChange={(e) => setSlideId(e.target.value)}
          placeholder="Enter slide ID (e.g., 1)"
          className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm"
        />
      </div>

      {/* File Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          File Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fileType"
              value="image"
              checked={fileType === 'image'}
              onChange={(e) => setFileType(e.target.value)}
              className="w-4 h-4 text-brand-600"
            />
            <span className="text-neutral-700 dark:text-neutral-300">Image</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fileType"
              value="video"
              checked={fileType === 'video'}
              onChange={(e) => setFileType(e.target.value)}
              className="w-4 h-4 text-brand-600"
            />
            <span className="text-neutral-700 dark:text-neutral-300">Video</span>
          </label>
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          Select File
        </label>
        <div className="flex gap-3">
          <input
            type="file"
            accept={fileType === 'video' ? 'video/*' : 'image/*'}
            onChange={handleFileSelect}
            className="flex-1 px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm"
          />
          {selectedFile && (
            <button
              onClick={handleClearTest}
              className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
        >
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Selected File
          </h3>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p><strong>Name:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
            <p><strong>Type:</strong> {selectedFile.type}</p>
          </div>
        </motion.div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-2">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
              className="bg-brand-600 h-full"
            />
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading || !slideId}
          className={`flex-1 py-3 px-6 rounded-lg font-bold text-white transition-all ${
            !selectedFile || uploading || !slideId
              ? 'bg-neutral-400 cursor-not-allowed'
              : 'bg-brand-600 hover:bg-brand-700 active:scale-95'
          }`}
        >
          {uploading ? 'Uploading...' : '📤 Upload to Firebase'}
        </button>
        
        <button
          onClick={handleFetchMedia}
          disabled={!slideId}
          className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
            !slideId
              ? 'bg-neutral-400 text-white cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95'
          }`}
        >
          📥 Fetch Media URL
        </button>
      </div>

      {/* Success Result */}
      {uploadResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                Upload Successful!
              </h3>
              <div className="text-sm text-green-700 dark:text-green-300 space-y-2">
                <p>Slide updated with {fileType} from Firebase Storage</p>
                {uploadResult.data && (
                  <div className="mt-2">
                    <p className="font-medium">Slide Data:</p>
                    <pre className="text-xs bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded mt-1 overflow-auto">
                      {JSON.stringify(uploadResult.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Fetched URL Result */}
      {fetchedUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">
                Media URL Retrieved (Cached)
              </h3>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                <a
                  href={fetchedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                  {fetchedUrl}
                </a>
              </div>

              {/* Preview */}
              {fileType === 'image' && fetchedUrl && (
                <div className="mt-4">
                  <p className="font-medium text-purple-900 dark:text-purple-200 mb-2">Preview:</p>
                  <img
                    src={fetchedUrl}
                    alt="Fetched"
                    className="max-w-full h-auto rounded-lg border border-purple-300 dark:border-purple-700"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              )}

              {fileType === 'video' && fetchedUrl && (
                <div className="mt-4">
                  <p className="font-medium text-purple-900 dark:text-purple-200 mb-2">Preview:</p>
                  <video
                    src={fetchedUrl}
                    controls
                    className="max-w-full h-auto rounded-lg border border-purple-300 dark:border-purple-700"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Section */}
      <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
          📝 Test Information
        </h3>
        <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
          <p>• Uploads to <code className="text-xs bg-neutral-100 dark:bg-neutral-700 px-1.5 py-0.5 rounded">modules/{'{moduleId}'}/slides/{'{slideId}'}/</code></p>
          <p>• Server-side caching prevents repeated Firebase Storage API calls</p>
          <p>• Client-side localStorage caching reduces bandwidth usage</p>
          <p>• URLs expire after 1 hour (server cache TTL)</p>
          <p>• Only admins can upload; authenticated users can fetch</p>
        </div>
      </div>
    </div>
  );
}

export default ModuleFirebaseTest;
