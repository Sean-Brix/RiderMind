import axios from 'axios';

const API_BASE_URL = '/api/quizzes';

/**
 * Get authentication token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('token');
}

/**
 * Get axios config with auth header
 */
function getConfig() {
  const token = getAuthToken();
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
}

/**
 * Quiz Service
 * Handles all quiz-related API calls
 */

// ============== Quiz Management ==============

/**
 * Get all quizzes with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.moduleId - Filter by module ID
 * @param {boolean} params.includeQuestions - Include questions in response
 * @param {boolean} params.includeOptions - Include options in response
 * @returns {Promise} Quiz list
 */
export async function getAllQuizzes(params = {}) {
  const response = await axios.get(API_BASE_URL, { ...getConfig(), params });
  return response.data;
}

/**
 * Get quiz by ID
 * @param {number} id - Quiz ID
 * @param {Object} params - Query parameters
 * @param {boolean} params.includeCorrectAnswers - Include correct answers (admin only)
 * @param {boolean} params.shuffle - Shuffle questions/options
 * @returns {Promise} Quiz details
 */
export async function getQuizById(id, params = {}) {
  const response = await axios.get(`${API_BASE_URL}/${id}`, { ...getConfig(), params });
  return response.data;
}

/**
 * Create a new quiz
 * @param {Object} quizData - Quiz data
 * @param {number} quizData.moduleId - Module ID to attach quiz to
 * @param {string} quizData.title - Quiz title
 * @param {string} quizData.description - Quiz description
 * @param {string} quizData.instructions - Quiz instructions
 * @param {number} quizData.passingScore - Passing score percentage (default: 70)
 * @param {number} quizData.timeLimit - Time limit in seconds (null = no limit)
 * @param {boolean} quizData.shuffleQuestions - Shuffle questions
 * @param {boolean} quizData.showResults - Show results after submission
 * @param {number} quizData.maxAttempts - Maximum attempts allowed
 * @param {boolean} quizData.allowReview - Allow reviewing past attempts
 * @param {Array} quizData.questions - Array of questions with options
 * @returns {Promise} Created quiz
 */
export async function createQuiz(quizData) {
  const response = await axios.post(API_BASE_URL, quizData, getConfig());
  return response.data;
}

/**
 * Update quiz
 * @param {number} id - Quiz ID
 * @param {Object} updateData - Updated quiz data
 * @returns {Promise} Updated quiz
 */
export async function updateQuiz(id, updateData) {
  const response = await axios.put(`${API_BASE_URL}/${id}`, updateData, getConfig());
  return response.data;
}

/**
 * Delete quiz
 * @param {number} id - Quiz ID
 * @returns {Promise} Deleted quiz info
 */
export async function deleteQuiz(id) {
  const response = await axios.delete(`${API_BASE_URL}/${id}`, getConfig());
  return response.data;
}

// ============== Question Management ==============

/**
 * Add question to quiz
 * @param {number} quizId - Quiz ID
 * @param {Object} questionData - Question data
 * @param {string} questionData.type - Question type (MULTIPLE_CHOICE, TRUE_FALSE, etc.)
 * @param {string} questionData.question - Question text
 * @param {number} questionData.points - Points for this question
 * @param {Array} questionData.options - Array of options
 * @returns {Promise} Created question
 */
export async function addQuestion(quizId, questionData) {
  const response = await axios.post(`${API_BASE_URL}/${quizId}/questions`, questionData, getConfig());
  return response.data;
}

/**
 * Update question
 * @param {number} questionId - Question ID
 * @param {Object} updateData - Updated question data
 * @returns {Promise} Updated question
 */
export async function updateQuestion(questionId, updateData) {
  const response = await axios.put(`${API_BASE_URL}/questions/${questionId}`, updateData, getConfig());
  return response.data;
}

/**
 * Delete question
 * @param {number} questionId - Question ID
 * @returns {Promise} Deleted question info
 */
export async function deleteQuestion(questionId) {
  const response = await axios.delete(`${API_BASE_URL}/questions/${questionId}`, getConfig());
  return response.data;
}

/**
 * Upload image for question
 * @param {number} questionId - Question ID
 * @param {File} imageFile - Image file
 * @returns {Promise} Upload result
 */
export async function uploadQuestionImage(questionId, imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);
  const token = getAuthToken();
  const response = await axios.post(`${API_BASE_URL}/questions/${questionId}/image`, formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
  return response.data;
}

/**
 * Get question image URL
 * @param {number} questionId - Question ID
 * @returns {string} Image URL
 */
export function getQuestionImageUrl(questionId) {
  return `${API_BASE_URL}/questions/${questionId}/image`;
}

// ============== Option Management ==============

/**
 * Add option to question
 * @param {number} questionId - Question ID
 * @param {Object} optionData - Option data
 * @param {string} optionData.optionText - Option text
 * @param {boolean} optionData.isCorrect - Is this the correct answer
 * @returns {Promise} Created option
 */
export async function addOption(questionId, optionData) {
  const response = await axios.post(`${API_BASE_URL}/questions/${questionId}/options`, optionData, getConfig());
  return response.data;
}

/**
 * Update option
 * @param {number} optionId - Option ID
 * @param {Object} updateData - Updated option data
 * @returns {Promise} Updated option
 */
export async function updateOption(optionId, updateData) {
  const response = await axios.put(`${API_BASE_URL}/options/${optionId}`, updateData, getConfig());
  return response.data;
}

/**
 * Delete option
 * @param {number} optionId - Option ID
 * @returns {Promise} Deleted option info
 */
export async function deleteOption(optionId) {
  const response = await axios.delete(`${API_BASE_URL}/options/${optionId}`, getConfig());
  return response.data;
}

// ============== Quiz Attempts ==============

/**
 * Submit quiz attempt
 * @param {number} quizId - Quiz ID
 * @param {Object} submissionData - Submission data
 * @param {Array} submissionData.answers - Array of answers
 * @param {number} submissionData.timeSpent - Time spent in seconds
 * @returns {Promise} Attempt result
 */
export async function submitQuiz(quizId, submissionData) {
  const response = await axios.post(`${API_BASE_URL}/${quizId}/submit`, submissionData, getConfig());
  return response.data;
}

/**
 * Get all attempts for current user (or specified user if admin)
 * @param {Object} params - Query parameters
 * @param {number} params.quizId - Filter by quiz ID
 * @param {number} params.userId - Filter by user ID (admin only)
 * @returns {Promise} List of attempts
 */
export async function getAttempts(params = {}) {
  const response = await axios.get(`${API_BASE_URL}/attempts/all`, { ...getConfig(), params });
  return response.data;
}

/**
 * Get attempt results by ID
 * @param {number} attemptId - Attempt ID
 * @returns {Promise} Attempt details with answers
 */
export async function getAttemptResults(attemptId) {
  const response = await axios.get(`${API_BASE_URL}/attempts/${attemptId}`, getConfig());
  return response.data;
}

// ============== Statistics ==============

/**
 * Get quiz statistics
 * @param {number} quizId - Quiz ID
 * @returns {Promise} Quiz statistics
 */
export async function getQuizStatistics(quizId) {
  // This endpoint doesn't exist yet in backend, but we'll create it
  const attempts = await getAttempts({ quizId });
  
  if (!attempts.data || attempts.data.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      passRate: 0,
      averageTime: 0
    };
  }

  const stats = attempts.data.reduce((acc, attempt) => {
    if (attempt.score !== null) {
      acc.totalScores += attempt.score;
      acc.scoredAttempts++;
    }
    if (attempt.passed) acc.passed++;
    if (attempt.timeSpent) acc.totalTime += attempt.timeSpent;
    return acc;
  }, { totalScores: 0, scoredAttempts: 0, passed: 0, totalTime: 0 });

  return {
    totalAttempts: attempts.data.length,
    averageScore: stats.scoredAttempts > 0 ? stats.totalScores / stats.scoredAttempts : 0,
    passRate: (stats.passed / attempts.data.length) * 100,
    averageTime: attempts.data.length > 0 ? stats.totalTime / attempts.data.length : 0
  };
}

export default {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  uploadQuestionImage,
  getQuestionImageUrl,
  addOption,
  updateOption,
  deleteOption,
  submitQuiz,
  getAttempts,
  getAttemptResults,
  getQuizStatistics
};
