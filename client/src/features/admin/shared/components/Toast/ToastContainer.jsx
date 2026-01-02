import React from 'react';
import { useToast } from '../../hooks/useToast';
import Toast from './Toast';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          action={toast.action}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
