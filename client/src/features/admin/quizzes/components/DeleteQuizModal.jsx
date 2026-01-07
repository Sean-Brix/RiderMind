import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

/**
 * Custom Delete Quiz Modal
 * Requires user to type "delete" to confirm quiz deletion
 */
export default function DeleteQuizModal({ isOpen, onClose, onConfirm, quizTitle, isBulk = false, count = 1 }) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (inputValue.toLowerCase() !== 'delete') {
      setError('You must type "delete" exactly to confirm.');
      return;
    }

    setIsDeleting(true);
    setError('');
    
    try {
      await onConfirm();
      handleClose();
    } catch (err) {
      setError('Failed to delete. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setInputValue('');
    setError('');
    setIsDeleting(false);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.toLowerCase() === 'delete') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full border border-red-200 dark:border-red-900/50 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              Delete Quiz{isBulk ? 'zes' : ''}
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Warning Message */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4">
            <p className="text-red-900 dark:text-red-200 font-semibold mb-2 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Warning: This action cannot be undone!
            </p>
            <p className="text-red-800 dark:text-red-300 text-sm">
              {isBulk 
                ? `You are about to permanently delete ${count} quiz${count > 1 ? 'zes' : ''}. All questions, answers, and quiz data will be lost forever.`
                : `You are about to permanently delete "${quizTitle}". All questions, answers, and quiz data will be lost forever.`
              }
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                Please type <span className="font-mono font-bold text-red-600 dark:text-red-400">delete</span> to confirm:
              </span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                disabled={isDeleting}
                placeholder="Type 'delete' here"
                className={`w-full px-4 py-3 rounded-lg border ${
                  error 
                    ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' 
                    : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800'
                } text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                autoFocus
              />
            </label>
            
            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </p>
            )}

            {/* Helper Text */}
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Press Enter to confirm or Escape to cancel
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors font-medium border border-neutral-300 dark:border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={inputValue.toLowerCase() !== 'delete' || isDeleting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Delete Forever
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
