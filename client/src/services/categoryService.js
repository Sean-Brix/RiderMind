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

/**
 * Add a module to a category
 * @param {number} categoryId - Category ID
 * @param {number} moduleId - Module ID to add
 */
export async function addModuleToCategory(categoryId, moduleId) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/${categoryId}/modules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ moduleId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add module');
  }

  return response.json();
}

/**
 * Bulk add multiple modules to a category
 * @param {number} categoryId - Category ID
 * @param {Array<number>} moduleIds - Array of module IDs to add
 */
export async function bulkAddModulesToCategory(categoryId, moduleIds) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/${categoryId}/modules/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ moduleIds })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add modules');
  }

  return response.json();
}

/**
 * Remove a module from a category
 * @param {number} categoryId - Category ID
 * @param {number} moduleId - Module ID to remove
 */
export async function removeModuleFromCategory(categoryId, moduleId) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/${categoryId}/modules/${moduleId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove module');
  }

  return response.json();
}

/**
 * Bulk remove multiple modules from a category
 * @param {number} categoryId - Category ID
 * @param {Array<number>} moduleIds - Array of module IDs to remove
 */
export async function bulkRemoveModulesFromCategory(categoryId, moduleIds) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/${categoryId}/modules/bulk`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ moduleIds })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove modules');
  }

  return response.json();
}

/**
 * Reorder modules in a category
 * @param {number} categoryId - Category ID
 * @param {Array<{moduleId: number, position: number}>} modulePositions - Array of module positions
 */
export async function reorderCategoryModules(categoryId, modulePositions) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/${categoryId}/modules/reorder`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ modules: modulePositions })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reorder modules');
  }

  return response.json();
}

/**
 * Update category modules (replace entire list with positions)
 * @param {number} categoryId - Category ID
 * @param {Array<{moduleId: number, position: number}>} modules - Array of modules with positions
 */
export async function updateCategoryModules(categoryId, modules) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/${categoryId}/modules`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ 
      modules: modules.map((m, index) => ({
        moduleId: m.moduleId || m.id,
        position: m.position !== undefined ? m.position : index
      }))
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update category modules');
  }

  return response.json();
}
