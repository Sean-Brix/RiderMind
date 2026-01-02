/**
 * Validate module data
 * @param {Object} module - Module data to validate
 * @returns {Object} { isValid, errors }
 */
export const validateModule = (module) => {
  const errors = {};

  if (!module.title?.trim()) {
    errors.title = 'Title is required';
  } else if (module.title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (module.title.length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }

  if (!module.description?.trim()) {
    errors.description = 'Description is required';
  } else if (module.description.length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }

  if (module.duration && module.duration < 1) {
    errors.duration = 'Duration must be positive';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate quiz data
 * @param {Object} quiz - Quiz data to validate
 * @returns {Object} { isValid, errors }
 */
export const validateQuiz = (quiz) => {
  const errors = {};

  if (!quiz.title?.trim()) {
    errors.title = 'Title is required';
  } else if (quiz.title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }

  if (!quiz.moduleId) {
    errors.moduleId = 'Module selection is required';
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    errors.questions = 'At least one question is required';
  }

  if (quiz.passingScore && (quiz.passingScore < 0 || quiz.passingScore > 100)) {
    errors.passingScore = 'Passing score must be between 0 and 100';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate slide data
 * @param {Object} slide - Slide data to validate
 * @returns {Object} { isValid, errors }
 */
export const validateSlide = (slide) => {
  const errors = {};

  if (!slide.type) {
    errors.type = 'Slide type is required';
  }

  if (!slide.title?.trim()) {
    errors.title = 'Slide title is required';
  }

  if (slide.type === 'video' && !slide.videoUrl) {
    errors.videoUrl = 'Video is required for video slides';
  }

  if (slide.type === 'image' && !slide.imageData) {
    errors.imageData = 'Image is required for image slides';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate question data
 * @param {Object} question - Question data to validate
 * @returns {Object} { isValid, errors }
 */
export const validateQuestion = (question) => {
  const errors = {};

  if (!question.question?.trim()) {
    errors.question = 'Question text is required';
  }

  if (!question.options || question.options.length < 2) {
    errors.options = 'At least 2 options are required';
  }

  const hasCorrectAnswer = question.options?.some(opt => opt.isCorrect);
  if (!hasCorrectAnswer) {
    errors.correctAnswer = 'At least one correct answer is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate media file
 * @param {File} file - File to validate
 * @param {string} type - 'image' or 'video'
 * @returns {Object} { isValid, errors }
 */
export const validateMediaFile = (file, type = 'image') => {
  const errors = [];

  if (!file) {
    return { isValid: false, errors: ['No file provided'] };
  }

  // Size validation
  const maxSize = type === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for videos
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${type === 'image' ? '5MB' : '50MB'}`);
  }

  // Format validation
  const allowedFormats = type === 'image' 
    ? ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    : ['video/mp4', 'video/webm', 'video/ogg'];

  if (!allowedFormats.includes(file.type)) {
    errors.push(`Invalid format. Allowed: ${allowedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
