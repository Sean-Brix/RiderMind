const API_BASE = '/api/student-modules';

/**
 * Get authentication token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('token');
}

/**
 * Get student's modules for a category (or default category A)
 * @param {number} categoryId - Optional category ID (defaults to type A)
 */
export async function getMyModules(categoryId = null) {
  const queryParams = new URLSearchParams();
  
  if (categoryId) {
    queryParams.append('categoryId', categoryId);
  }

  const url = queryParams.toString() 
    ? `${API_BASE}/my-modules?${queryParams}` 
    : `${API_BASE}/my-modules`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch modules');
  }

  return await response.json();
}

/**
 * Update progress on a module
 * @param {number} moduleId - Module ID
 * @param {Object} data - Progress data
 * @param {number} data.categoryId - Category ID
 * @param {number} data.currentSlideId - Current slide ID
 * @param {number} data.progress - Progress percentage (0-100)
 */
export async function updateModuleProgress(moduleId, data) {
  const response = await fetch(`${API_BASE}/${moduleId}/progress`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update progress');
  }

  return await response.json();
}

/**
 * Record a quiz attempt
 * @param {number} moduleId - Module ID
 * @param {Object} data - Quiz attempt data
 * @param {number} data.categoryId - Category ID
 * @param {number} data.quizScore - Quiz score percentage
 * @param {number} data.quizAttemptId - Quiz attempt ID from quiz system
 * @param {boolean} data.passed - Whether the quiz was passed
 */
export async function recordQuizAttempt(moduleId, data) {
  const response = await fetch(`${API_BASE}/${moduleId}/quiz-attempt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to record quiz attempt');
  }

  return await response.json();
}

/**
 * Complete a module (after passing quiz)
 * @param {number} moduleId - Module ID
 * @param {Object} data - Completion data
 * @param {number} data.categoryId - Category ID
 * @param {number} data.quizScore - Quiz score percentage
 * @param {number} data.quizAttemptId - Quiz attempt ID
 */
export async function completeModule(moduleId, data) {
  const response = await fetch(`${API_BASE}/${moduleId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to complete module');
  }

  return await response.json();
}

/**
 * Submit quiz attempt and get results
 * @param {number} moduleId - Module ID
 * @param {Object} data - Quiz submission data
 * @param {number} data.categoryId - Category ID
 * @param {number} data.quizId - Quiz ID
 * @param {Array} data.answers - Array of answers
 * @param {number} data.timeSpent - Time spent in seconds
 */
export async function submitQuizAttempt(moduleId, data) {
  const response = await fetch(`${API_BASE}/${moduleId}/submit-quiz`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit quiz');
  }

  return await response.json();
}
