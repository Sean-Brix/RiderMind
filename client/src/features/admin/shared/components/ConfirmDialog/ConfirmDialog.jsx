import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, confirmText, cancelText, variant, onConfirm, onCancel }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const variantStyles = {
    default: {
      confirmBtn: 'bg-brand-600 hover:bg-brand-700 text-white',
      icon: '❓'
    },
    danger: {
      confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
      icon: '⚠️'
    }
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">{styles.icon}</div>
            <div className="flex-1">
              <h3 id="confirm-dialog-title" className="text-lg font-bold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-gray-600 text-sm">{message}</p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors ${styles.confirmBtn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
