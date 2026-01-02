import React from 'react';

const LoadingSpinner = ({ size = 'medium', fullPage = false, message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`${sizeClasses[size]} border-gray-300 border-t-brand-600 rounded-full animate-spin`}
        role="status"
        aria-label={message}
      />
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{spinner}</div>;
};

export default LoadingSpinner;
