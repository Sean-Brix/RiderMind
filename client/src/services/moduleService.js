const API_BASE = '/api/modules';

/**
 * Helper function to convert File to base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('token');
}

/**
 * Get all modules
 * @param {Object} params - Query parameters
 * @param {boolean} params.isActive - Filter by active status
 * @param {boolean} params.includeObjectives - Include objectives
 * @param {boolean} params.includeSlides - Include slides
 */
export async function getAllModules(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.isActive !== undefined) {
    queryParams.append('isActive', params.isActive);
  }
  if (params.includeObjectives) {
    queryParams.append('includeObjectives', 'true');
  }
  if (params.includeSlides) {
    queryParams.append('includeSlides', 'true');
  }

  const url = queryParams.toString() 
    ? `${API_BASE}?${queryParams}` 
    : API_BASE;

  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch modules');
  }

  return response.json();
}

/**
 * Get a single module by ID
 * @param {number} moduleId - Module ID
 */
export async function getModuleById(moduleId) {
  const response = await fetch(`${API_BASE}/${moduleId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch module');
  }

  return response.json();
}

/**
 * Create a new module
 * @param {Object} moduleData - Module data
 */
export async function createModule(moduleData) {
  const token = getAuthToken();
  
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(moduleData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create module');
  }

  return response.json();
}

/**
 * Update a module
 * @param {number} moduleId - Module ID
 * @param {Object} moduleData - Updated module data
 */
export async function updateModule(moduleId, moduleData) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/${moduleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(moduleData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update module');
  }

  return response.json();
}

/**
 * Delete a module
 * @param {number} moduleId - Module ID
 */
export async function deleteModule(moduleId) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/${moduleId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete module');
  }

  return response.json();
}

/**
 * Add objective to a module
 * @param {number} moduleId - Module ID
 * @param {Object} objectiveData - Objective data
 */
export async function addObjective(moduleId, objectiveData) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/${moduleId}/objectives`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(objectiveData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add objective');
  }

  return response.json();
}

/**
 * Update an objective
 * @param {number} objectiveId - Objective ID
 * @param {Object} objectiveData - Updated objective data
 */
export async function updateObjective(objectiveId, objectiveData) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/objectives/${objectiveId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(objectiveData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update objective');
  }

  return response.json();
}

/**
 * Delete an objective
 * @param {number} objectiveId - Objective ID
 */
export async function deleteObjective(objectiveId) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/objectives/${objectiveId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete objective');
  }

  return response.json();
}

/**
 * Add slide to a module
 * @param {number} moduleId - Module ID
 * @param {Object} slideData - Slide data (includes imageFile for image type)
 */
export async function addSlide(moduleId, slideData) {
  const token = getAuthToken();
  
  // Prepare request body
  const requestBody = {
    type: slideData.type,
    title: slideData.title,
    content: slideData.content,
    description: slideData.description,
    position: slideData.position
  };

  // If it's an image slide and there's a file, convert to base64
  if (slideData.type === 'image' && slideData.imageFile) {
    const base64 = await fileToBase64(slideData.imageFile);
    requestBody.imageData = base64;
    requestBody.imageMime = slideData.imageFile.type;
  }
  
  const response = await fetch(`${API_BASE}/${moduleId}/slides`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add slide');
  }

  return response.json();
}

/**
 * Update a slide
 * @param {number} slideId - Slide ID
 * @param {Object} slideData - Updated slide data (includes imageFile for image type)
 */
export async function updateSlide(slideId, slideData) {
  const token = getAuthToken();
  
  // Prepare request body
  const requestBody = {
    type: slideData.type,
    title: slideData.title,
    content: slideData.content,
    description: slideData.description,
    position: slideData.position
  };

  // If it's an image slide and there's a file, convert to base64
  if (slideData.type === 'image' && slideData.imageFile) {
    const base64 = await fileToBase64(slideData.imageFile);
    requestBody.imageData = base64;
    requestBody.imageMime = slideData.imageFile.type;
  }
  
  const response = await fetch(`${API_BASE}/slides/${slideId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update slide');
  }

  return response.json();
}

/**
 * Delete a slide
 * @param {number} slideId - Slide ID
 */
export async function deleteSlide(slideId) {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/slides/${slideId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete slide');
  }

  return response.json();
}

/**
 * Upload video to a slide
 * @param {number} slideId - Slide ID
 * @param {File} videoFile - Video file
 */
export async function uploadSlideVideo(slideId, videoFile) {
  const token = getAuthToken();
  
  const formData = new FormData();
  formData.append('video', videoFile);

  const response = await fetch(`${API_BASE}/slides/${slideId}/video`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload video');
  }

  return response.json();
}

/**
 * Get slide image URL
 * @param {number} slideId - Slide ID
 */
export function getSlideImageUrl(slideId) {
  return `${API_BASE}/slides/${slideId}/image`;
}

/**
 * Get slide video URL
 * @param {number} slideId - Slide ID
 */
export function getSlideVideoUrl(slideId) {
  return `${API_BASE}/slides/${slideId}/video`;
}
