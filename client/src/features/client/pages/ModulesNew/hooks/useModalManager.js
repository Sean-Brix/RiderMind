import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Modal Types Enum
 * Defines all possible modal states in the application
 */
export const ModalType = {
  NONE: 'NONE',
  LESSON: 'LESSON',
  QUIZ: 'QUIZ',
  QUIZ_RESULTS: 'QUIZ_RESULTS',
  CONGRATULATIONS: 'CONGRATULATIONS',
};

/**
 * useModalManager Hook
 * 
 * Centralized modal state management to prevent conflicts.
 * Ensures only one modal is open at a time with clean transitions.
 * 
 * Features:
 * - Single source of truth for modal state
 * - Automatic cleanup on modal close
 * - Transition callbacks for modal sequences
 * - Modal data management
 * - Memory leak prevention
 * 
 * @returns {Object} Modal manager interface
 */
export function useModalManager() {
  const [activeModal, setActiveModal] = useState(ModalType.NONE);
  const [modalData, setModalData] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Store cleanup callbacks for each modal type
  const cleanupCallbacks = useRef({});
  const transitionCallbacks = useRef({});

  /**
   * Register a cleanup function for a specific modal
   * This will be called when the modal closes
   */
  const registerCleanup = useCallback((modalType, cleanupFn) => {
    cleanupCallbacks.current[modalType] = cleanupFn;
  }, []);

  /**
   * Register a transition callback for modal sequences
   * E.g., Lesson -> Quiz, Quiz -> Results
   */
  const registerTransition = useCallback((fromModal, toModal, transitionFn) => {
    const key = `${fromModal}->${toModal}`;
    transitionCallbacks.current[key] = transitionFn;
  }, []);

  /**
   * Open a modal with optional data
   * Closes any currently open modal first
   */
  const openModal = useCallback((modalType, data = null, options = {}) => {
    const { skipCleanup = false, transitionDelay = 0 } = options;

    // Close current modal first (unless we're transitioning)
    if (activeModal !== ModalType.NONE && !skipCleanup) {
      closeModal({ immediate: transitionDelay === 0 });
    }

    // Set transitioning state
    setIsTransitioning(true);

    // Delay opening if specified (for smooth transitions)
    setTimeout(() => {
      setActiveModal(modalType);
      setModalData(data);
      setIsTransitioning(false);
    }, transitionDelay);
  }, [activeModal]);

  /**
   * Close the currently active modal
   * Runs cleanup callbacks and clears state
   */
  const closeModal = useCallback((options = {}) => {
    const { immediate = true, onClosed } = options;

    // Run cleanup for the active modal
    const cleanup = cleanupCallbacks.current[activeModal];
    if (cleanup && typeof cleanup === 'function') {
      try {
        cleanup();
      } catch (error) {
        console.error(`Cleanup error for ${activeModal}:`, error);
      }
    }

    // Clear state
    const clearState = () => {
      setActiveModal(ModalType.NONE);
      setModalData(null);
      setIsTransitioning(false);
      
      // Call onClosed callback if provided
      if (onClosed && typeof onClosed === 'function') {
        onClosed();
      }
    };

    if (immediate) {
      clearState();
    } else {
      // Delay for animation to complete
      setTimeout(clearState, 300);
    }
  }, [activeModal]);

  /**
   * Transition from one modal to another
   * Useful for sequences like Lesson -> Quiz -> Results
   */
  const transitionModal = useCallback((toModalType, data = null, delay = 300) => {
    const key = `${activeModal}->${toModalType}`;
    const transitionFn = transitionCallbacks.current[key];

    // Run transition callback if registered
    if (transitionFn && typeof transitionFn === 'function') {
      try {
        transitionFn(modalData, data);
      } catch (error) {
        console.error(`Transition error for ${key}:`, error);
      }
    }

    // Close current modal
    closeModal({ immediate: false });

    // Open new modal after delay
    setTimeout(() => {
      openModal(toModalType, data, { skipCleanup: true });
    }, delay);
  }, [activeModal, modalData, closeModal, openModal]);

  /**
   * Update data for the currently active modal
   * Useful for updating lesson progress, quiz answers, etc.
   */
  const updateModalData = useCallback((updater) => {
    setModalData(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return { ...prev, ...updater };
    });
  }, []);

  /**
   * Check if a specific modal is currently open
   */
  const isModalOpen = useCallback((modalType) => {
    return activeModal === modalType;
  }, [activeModal]);

  /**
   * Check if any modal is open
   */
  const isAnyModalOpen = useCallback(() => {
    return activeModal !== ModalType.NONE;
  }, [activeModal]);

  /**
   * Cleanup on unmount to prevent memory leaks
   */
  useEffect(() => {
    return () => {
      // Clear all callbacks on unmount
      cleanupCallbacks.current = {};
      transitionCallbacks.current = {};
    };
  }, []);

  return {
    // State
    activeModal,
    modalData,
    isTransitioning,
    
    // Actions
    openModal,
    closeModal,
    transitionModal,
    updateModalData,
    
    // Queries
    isModalOpen,
    isAnyModalOpen,
    
    // Registration
    registerCleanup,
    registerTransition,
    
    // Constants
    ModalType,
  };
}

/**
 * Helper hook for individual modal components
 * Simplifies modal logic by providing isOpen and close handlers
 */
export function useModal(modalType, modalManager) {
  const isOpen = modalManager.isModalOpen(modalType);
  const data = isOpen ? modalManager.modalData : null;

  const close = useCallback((options) => {
    if (isOpen) {
      modalManager.closeModal(options);
    }
  }, [isOpen, modalManager]);

  const updateData = useCallback((updater) => {
    if (isOpen) {
      modalManager.updateModalData(updater);
    }
  }, [isOpen, modalManager]);

  return {
    isOpen,
    data,
    close,
    updateData,
  };
}

export default useModalManager;
