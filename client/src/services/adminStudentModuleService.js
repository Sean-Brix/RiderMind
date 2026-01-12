const API_BASE = '/api/admin/student-modules';

/**
 * Get authentication token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('token');
}

/**
 * Get all student modules with filtering, searching, and pagination
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search by user ID or student module ID
 * @param {string} params.status - Filter by status (all, ongoing, completed)
 * @param {number} params.page - Page number (1-based)
 * @param {number} params.limit - Items per page
 * @param {string} params.sortBy - Sort field
 * @param {string} params.sortOrder - Sort order (asc, desc)
 */
export async function getAllStudentModules(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.append('search', params.search);
  if (params.status && params.status !== 'all') queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const url = queryParams.toString() 
    ? `${API_BASE}?${queryParams}` 
    : API_BASE;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch student modules');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch student modules:', error);
    throw error;
  }
}

/**
 * Get student module by ID
 * @param {number} studentModuleId - Student module ID
 */
export async function getStudentModuleById(studentModuleId) {
  try {
    const response = await fetch(`${API_BASE}/${studentModuleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch student module');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch student module:', error);
    throw error;
  }
}

/**
 * Get statistics about student modules
 */
export async function getStudentModuleStats() {
  try {
    const response = await fetch(`${API_BASE}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    throw error;
  }
}
