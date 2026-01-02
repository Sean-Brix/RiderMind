import { useState, useCallback } from 'react';

/**
 * Hook for confirmation dialogs
 * @returns {Object} { confirm, isOpen, confirmData, closeConfirm }
 */
export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default' // 'default', 'danger'
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmData({
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'default',
        onConfirm: () => {
          resolve(true);
          setIsOpen(false);
        },
        onCancel: () => {
          resolve(false);
          setIsOpen(false);
        }
      });
      setIsOpen(true);
    });
  }, []);

  const closeConfirm = useCallback(() => {
    if (confirmData.onCancel) {
      confirmData.onCancel();
    }
    setIsOpen(false);
  }, [confirmData]);

  return {
    confirm,
    isOpen,
    confirmData,
    closeConfirm
  };
};
