/**
 * Modal Helpers
 * Utility functions for modal lifecycle management
 */

/**
 * Create a modal data object for lessons
 * Standardizes the data structure passed to lesson modals
 */
export function createLessonModalData({
  moduleId,
  studentModuleId,
  categoryId,
  title,
  description,
  objectives = [],
  slides = [],
  currentSlideIndex = 0,
  quiz = null,
  progress = 0,
  skipToQuiz = false,
}) {
  return {
    type: 'lesson',
    moduleId,
    studentModuleId,
    categoryId,
    title,
    description,
    objectives,
    slides,
    currentSlideIndex,
    quiz,
    progress,
    skipToQuiz,
  };
}

/**
 * Create a modal data object for quizzes
 * Standardizes the data structure passed to quiz modals
 */
export function createQuizModalData({
  moduleId,
  studentModuleId,
  categoryId,
  quiz,
  moduleTitle,
  fromLesson = false,
}) {
  return {
    type: 'quiz',
    moduleId,
    studentModuleId,
    categoryId,
    quiz,
    moduleTitle,
    fromLesson,
  };
}

/**
 * Create a modal data object for quiz results
 * Standardizes the data structure passed to results modals
 */
export function createQuizResultsModalData({
  moduleId,
  studentModuleId,
  score,
  passed,
  totalQuestions,
  correctAnswers,
  timeSpent,
  canRetry = true,
}) {
  return {
    type: 'quiz_results',
    moduleId,
    studentModuleId,
    score,
    passed,
    totalQuestions,
    correctAnswers,
    timeSpent,
    canRetry,
  };
}

/**
 * Create a modal data object for congratulations
 * Standardizes the data structure passed to completion modals
 */
export function createCongratulationsModalData({
  studentData,
  categoryData,
  totalXP,
  level,
  completedModules,
}) {
  return {
    type: 'congratulations',
    studentData,
    categoryData,
    totalXP,
    level,
    completedModules,
  };
}

/**
 * Validate modal data structure
 * Ensures required fields are present
 */
export function validateModalData(data, requiredFields = []) {
  if (!data) {
    return { valid: false, missing: ['data object'] };
  }

  const missing = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null;
  });

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Create cleanup function for lesson modal
 * Handles any necessary cleanup when lesson modal closes
 */
export function createLessonCleanup(callbacks = {}) {
  return () => {
    const { onProgressSave, onExit } = callbacks;
    
    // Save progress before closing
    if (onProgressSave && typeof onProgressSave === 'function') {
      onProgressSave();
    }
    
    // Run exit callback
    if (onExit && typeof onExit === 'function') {
      onExit();
    }
  };
}

/**
 * Create cleanup function for quiz modal
 * Handles any necessary cleanup when quiz modal closes
 */
export function createQuizCleanup(callbacks = {}) {
  return () => {
    const { onAbandon, onExit } = callbacks;
    
    // Handle quiz abandonment
    if (onAbandon && typeof onAbandon === 'function') {
      onAbandon();
    }
    
    // Run exit callback
    if (onExit && typeof onExit === 'function') {
      onExit();
    }
  };
}

/**
 * Create transition function from lesson to quiz
 * Handles the transition logic and data transformation
 */
export function createLessonToQuizTransition(callbacks = {}) {
  return (lessonData, quizData) => {
    const { onLessonComplete, onQuizStart } = callbacks;
    
    // Mark lesson as viewed/completed
    if (onLessonComplete && typeof onLessonComplete === 'function') {
      onLessonComplete(lessonData);
    }
    
    // Initialize quiz
    if (onQuizStart && typeof onQuizStart === 'function') {
      onQuizStart(quizData);
    }
  };
}

/**
 * Create transition function from quiz to results
 * Handles the transition logic and data transformation
 */
export function createQuizToResultsTransition(callbacks = {}) {
  return (quizData, resultsData) => {
    const { onQuizSubmit, onResultsShow } = callbacks;
    
    // Process quiz submission
    if (onQuizSubmit && typeof onQuizSubmit === 'function') {
      onQuizSubmit(quizData, resultsData);
    }
    
    // Show results
    if (onResultsShow && typeof onResultsShow === 'function') {
      onResultsShow(resultsData);
    }
  };
}

/**
 * Debounce function for modal operations
 * Prevents rapid opening/closing
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if modal should be blocked
 * Useful for preventing modal spam or enforcing prerequisites
 */
export function shouldBlockModal(modalType, currentState, rules = {}) {
  const { maxModalDepth = 2, requireModuleUnlock = true } = rules;
  
  // Add custom blocking logic here
  // Example: Don't open quiz if lesson not completed
  if (modalType === 'quiz' && requireModuleUnlock) {
    if (!currentState.lessonCompleted) {
      return {
        blocked: true,
        reason: 'Please complete the lesson first',
      };
    }
  }
  
  return {
    blocked: false,
    reason: null,
  };
}

/**
 * Generate modal transition delay based on modal types
 * Provides smooth transitions between different modal types
 */
export function getTransitionDelay(fromModal, toModal) {
  const delays = {
    'lesson->quiz': 400,
    'quiz->quiz_results': 500,
    'quiz_results->lesson': 300,
    'quiz_results->congratulations': 600,
    'default': 300,
  };
  
  const key = `${fromModal}->${toModal}`;
  return delays[key] || delays.default;
}

/**
 * Log modal state changes for debugging
 * Helps track modal lifecycle issues
 */
export function logModalState(action, modalType, data = {}) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎭 Modal ${action}:`, {
      modal: modalType,
      timestamp: new Date().toISOString(),
      data,
    });
  }
}

/**
 * Handle modal errors gracefully
 * Provides consistent error handling across modals
 */
export function handleModalError(error, modalType, callbacks = {}) {
  const { onError, fallbackModal } = callbacks;
  
  console.error(`❌ Modal Error (${modalType}):`, error);
  
  // Call custom error handler
  if (onError && typeof onError === 'function') {
    onError(error, modalType);
  }
  
  // Return fallback action
  return {
    shouldClose: true,
    shouldOpenFallback: !!fallbackModal,
    fallbackModal,
  };
}

export default {
  createLessonModalData,
  createQuizModalData,
  createQuizResultsModalData,
  createCongratulationsModalData,
  validateModalData,
  createLessonCleanup,
  createQuizCleanup,
  createLessonToQuizTransition,
  createQuizToResultsTransition,
  debounce,
  shouldBlockModal,
  getTransitionDelay,
  logModalState,
  handleModalError,
};
