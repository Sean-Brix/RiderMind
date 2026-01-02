import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const Toast = ({ id, message, type = 'info', action, onClose }) => {
  const typeStyles = {
    success: 'bg-green-50 border-green-500 text-green-900',
    error: 'bg-red-50 border-red-500 text-red-900',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
    info: 'bg-blue-50 border-blue-500 text-blue-900'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg ${typeStyles[type]} min-w-[300px] max-w-md animate-slide-in-right`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium break-words">{message}</p>
        {action && (
          <button
            onClick={() => {
              action.onClick();
              onClose(id);
            }}
            className="mt-2 text-sm font-semibold underline hover:no-underline"
          >
            {action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
