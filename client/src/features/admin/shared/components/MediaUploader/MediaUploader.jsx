import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { validateMediaFile, formatFileSize } from '../../utils';

const MediaUploader = ({
  type = 'image',
  onUpload,
  maxSize,
  accept,
  preview = true,
  className = ''
}) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    setError(null);

    const validation = validateMediaFile(selectedFile, type);
    if (!validation.isValid) {
      setError(validation.errors.join('. '));
      return;
    }

    setFile(selectedFile);

    if (preview) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(selectedFile);
    }

    handleUpload(selectedFile);
  };

  const handleUpload = async (fileToUpload) => {
    setUploading(true);
    setProgress(0);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      await onUpload(fileToUpload);
      setProgress(100);
      clearInterval(interval);
    } catch (err) {
      setError(err.message || 'Upload failed');
      setFile(null);
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let item of items) {
      if (item.type.startsWith('image/')) {
        const pastedFile = item.getAsFile();
        if (pastedFile) {
          handleFileSelect(pastedFile);
        }
      }
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`} onPaste={handlePaste}>
      {!file && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-brand-500 hover:bg-brand-50/50 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept || (type === 'image' ? 'image/*' : 'video/*')}
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) handleFileSelect(selectedFile);
            }}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              {type === 'image' ? (
                <ImageIcon className="w-6 h-6 text-gray-400" />
              ) : (
                <VideoIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Drop {type} here, paste, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Max size: {formatFileSize(maxSize || (type === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024))}
              </p>
            </div>
            <Upload className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      )}

      {file && preview && previewUrl && (
        <div className="relative rounded-lg overflow-hidden bg-gray-100">
          {type === 'image' ? (
            <img src={previewUrl} alt="Preview" className="w-full h-48 object-contain" />
          ) : (
            <video src={previewUrl} controls className="w-full h-48" />
          )}
          
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-3 bg-white border-t">
            <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Uploading...</span>
            <span className="text-gray-900 font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
