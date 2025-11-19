import { useState } from 'react';
import { motion } from 'framer-motion';

function FirebaseTest() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('video'); // 'video' or 'image'
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

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
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append(fileType, selectedFile);

      const token = localStorage.getItem('token');
      
      // Simulate progress (replace with actual progress if backend supports it)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      // You'll create this endpoint later
      const response = await fetch(`/api/dev/test-firebase-upload`, {
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

  const handleClearTest = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setError('');
    setUploadProgress(0);
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
            🔥 Firebase Storage Test
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Test file uploads to Firebase Storage (videos and images)
          </p>
        </div>
        <div className="text-4xl">📤</div>
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
              value="video"
              checked={fileType === 'video'}
              onChange={(e) => setFileType(e.target.value)}
              className="w-4 h-4 text-brand-600"
            />
            <span className="text-neutral-700 dark:text-neutral-300">Video (MP4, WebM)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fileType"
              value="image"
              checked={fileType === 'image'}
              onChange={(e) => setFileType(e.target.value)}
              className="w-4 h-4 text-brand-600"
            />
            <span className="text-neutral-700 dark:text-neutral-300">Image (JPG, PNG, GIF)</span>
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

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all mb-6 ${
          !selectedFile || uploading
            ? 'bg-neutral-400 cursor-not-allowed'
            : 'bg-brand-600 hover:bg-brand-700 active:scale-95'
        }`}
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Uploading...
          </span>
        ) : (
          '📤 Upload to Firebase'
        )}
      </button>

      {/* Success Result */}
      {uploadResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
        >
          <div className="flex items-start gap-3 mb-3">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                Upload Successful!
              </h3>
              <div className="text-sm text-green-700 dark:text-green-300 space-y-2">
                <div>
                  <p className="font-medium mb-1">Download URL:</p>
                  <a
                    href={uploadResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {uploadResult.url}
                  </a>
                </div>
                {uploadResult.path && (
                  <div>
                    <p className="font-medium mb-1">Storage Path:</p>
                    <code className="text-xs bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                      {uploadResult.path}
                    </code>
                  </div>
                )}
              </div>

              {/* Preview */}
              {fileType === 'image' && uploadResult.url && (
                <div className="mt-4">
                  <p className="font-medium text-green-900 dark:text-green-200 mb-2">Preview:</p>
                  <img
                    src={uploadResult.url}
                    alt="Uploaded"
                    className="max-w-full h-auto rounded-lg border border-green-300 dark:border-green-700"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              )}

              {fileType === 'video' && uploadResult.url && (
                <div className="mt-4">
                  <p className="font-medium text-green-900 dark:text-green-200 mb-2">Preview:</p>
                  <video
                    src={uploadResult.url}
                    controls
                    className="max-w-full h-auto rounded-lg border border-green-300 dark:border-green-700"
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
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                Upload Failed
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
          <p>• This endpoint tests Firebase Storage integration</p>
          <p>• Files are uploaded to <code className="text-xs bg-neutral-100 dark:bg-neutral-700 px-1.5 py-0.5 rounded">test-uploads/</code> folder</p>
          <p>• Maximum file size: 100MB</p>
          <p>• Supported formats: MP4, WebM for videos | JPG, PNG, GIF for images</p>
          <p className="text-amber-600 dark:text-amber-400">⚠️ Remember to implement the backend endpoint first!</p>
        </div>
      </div>
    </div>
  );
}

export default FirebaseTest;
