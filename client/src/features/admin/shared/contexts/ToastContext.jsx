import React, { createContext, useState, useCallback, useContext } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((messageOrOptions, type = 'info', duration = 5000, action = null) => {
    const id = Date.now() + Math.random();
    
    // Support both object and separate parameters
    let toast;
    if (typeof messageOrOptions === 'object' && messageOrOptions !== null) {
      toast = {
        id,
        message: messageOrOptions.message,
        type: messageOrOptions.type || 'info',
        action: messageOrOptions.action || null,
        duration: messageOrOptions.duration ?? 5000
      };
    } else {
      toast = {
        id,
        message: messageOrOptions,
        type,
        action,
        duration
      };
    }

    setToasts(prev => [...prev, toast]);

    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    toasts,
    showToast,
    removeToast,
    clearAll
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};

export { ToastContext };
