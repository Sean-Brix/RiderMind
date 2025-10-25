export default function FileUpload({ type, file, onChange, onRemove }) {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-brand-500', 'bg-brand-50', 'dark:bg-brand-900/20');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-brand-500', 'bg-brand-50', 'dark:bg-brand-900/20');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-brand-500', 'bg-brand-50', 'dark:bg-brand-900/20');
    const droppedFile = e.dataTransfer.files[0];
    
    if (droppedFile) {
      const validTypes = type === 'image' 
        ? ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
        : ['video/mp4', 'video/webm', 'video/ogg'];
      
      if (validTypes.includes(droppedFile.type)) {
        onChange(droppedFile);
      } else {
        alert(`Please upload a valid ${type} file`);
      }
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      onChange(selectedFile);
    }
  };

  return (
    <div className="space-y-2">
      {/* File Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 text-center transition-colors"
      >
        <input
          type="file"
          id="slideFileInput"
          accept={type === 'image' ? 'image/*' : 'video/*'}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2">
          {file ? (
            <>
              <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {file.name}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={onRemove}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Remove file
              </button>
            </>
          ) : (
            <>
              <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                <label htmlFor="slideFileInput" className="text-brand-600 dark:text-brand-400 hover:underline cursor-pointer">
                  Click to upload
                </label>
                {' '}or drag and drop
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {type === 'image' ? 'PNG, JPG, GIF up to 10MB' : 'MP4, WebM up to 50MB'}
              </p>
            </>
          )}
        </div>
      </div>
      
      {/* Preview */}
      {file && (
        <div className="mt-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">Preview:</p>
          {type === 'image' ? (
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="max-w-full h-auto rounded-lg max-h-64 object-contain"
            />
          ) : (
            <video
              src={URL.createObjectURL(file)}
              controls
              className="max-w-full h-auto rounded-lg max-h-64"
            />
          )}
        </div>
      )}
    </div>
  );
}
