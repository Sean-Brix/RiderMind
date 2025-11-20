/**
 * AvatarCard - Compact avatar display with name and email
 * Overlaps the header banner for modern profile design
 */
import { useState, useRef } from 'react';

export default function AvatarCard({ name, avatarUrl, role, email, onUpload, onDelete, className = '' }) {
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);

  // Get initials from name
  const getInitials = (fullName) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Avatar - circular with gradient background and upload overlay */}
      <div 
        className="relative cursor-pointer"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="flex w-24 h-24 rounded-full bg-white dark:bg-neutral-900 p-1 shadow-lg">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={name}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                const fallback = e.target.nextElementSibling;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold"
            style={{ display: avatarUrl ? 'none' : 'flex' }}
          >
            {getInitials(name)}
          </div>
        </div>

        {/* Online indicator */}
        <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-neutral-900 rounded-full"></div>

        {/* Upload/Delete overlay on hover */}
        {isHovering && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <div className="flex gap-2">
              <button
                onClick={handleUploadClick}
                className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                title="Upload picture"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              {avatarUrl && onDelete && (
                <button
                  onClick={handleDeleteClick}
                  className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                  title="Delete picture"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Name and details */}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 truncate">
          {name}
        </h1>
        {role && (
          <p className="flex text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            {role}
          </p>
        )}
      </div>
    </div>
  );
}
