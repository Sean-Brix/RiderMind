const API_BASE = '/api/categories';

/**
 * Get authentication token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('token');
}

/**
 * Get all categories
 * @param {Object} params - Query parameters
 * @param {boolean} params.isActive - Filter by active status
 */
export async function getAllCategories(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.isActive !== undefined) {
    queryParams.append('isActive', params.isActive);
  }

  const url = queryParams.toString() 
    ? `${API_BASE}?${queryParams}` 
    : API_BASE;

  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch categories');
  }

  return response.json();
}

/**
 * Get a single category by ID
 * @param {number} categoryId - Category ID
 */
export async function getCategoryById(categoryId) {
  const response = await fetch(`${API_BASE}/${categoryId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch category');
  }

  return response.json();
}

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 */
export async function createCategory(categoryData) {
  const token = getAuthToken();
  
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(categoryData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create category');
  }

  return response.json();
}

/**
 * Update a category
 * @param {number} categoryId - Category ID
 * @param {Object} categoryData - Updated category data
 */
export async function updateCategory(categoryId, categoryData) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/${categoryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(categoryData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update category');
  }

  return response.json();
}

/**
 * Delete a category
 * @param {number} categoryId - Category ID
 */
export async function deleteCategory(categoryId) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete category');
  }

  return response.json();
}

/**
 * Assign modules to a category
 * @param {number} categoryId - Category ID
 * @param {Array<number>} moduleIds - Array of module IDs in desired order
 */
export async function assignModulesToCategory(categoryId, moduleIds) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/${categoryId}/modules`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ moduleIds })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to assign modules');
  }

  return response.json();
}
