const API_BASE = '/api';

function getAuthToken() {
  return localStorage.getItem('token');
}

/**
 * Get overall system analytics
 */
export async function getSystemAnalytics() {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/analytics/system`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch system analytics');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching system analytics:', error);
    throw error;
  }
}

/**
 * Get user engagement analytics
 */
export async function getUserEngagement(timeframe = '30d') {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/analytics/users?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user engagement');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching user engagement:', error);
    throw error;
  }
}

/**
 * Get module performance analytics
 */
export async function getModulePerformance() {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/analytics/modules`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch module performance');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching module performance:', error);
    throw error;
  }
}

/**
 * Get quiz performance analytics
 */
export async function getQuizPerformance() {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/analytics/quizzes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quiz performance');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching quiz performance:', error);
    throw error;
  }
}

/**
 * Get module feedback analytics
 */
export async function getModuleFeedbackAnalytics() {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/analytics/feedback/modules`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch module feedback analytics');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching module feedback analytics:', error);
    throw error;
  }
}

/**
 * Get quiz reaction analytics
 */
export async function getQuizReactionAnalytics() {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/analytics/feedback/quizzes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quiz reaction analytics');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching quiz reaction analytics:', error);
    throw error;
  }
}

/**
 * Get reactions for a specific quiz
 */
export async function getQuizReactions(quizId) {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/quizzes/${quizId}/reactions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quiz reactions');
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching quiz reactions:', error);
    throw error;
  }
}

/**
 * Fetch aggregated data from existing endpoints as fallback
 */
export async function getAggregatedAnalytics() {
  try {
    const token = getAuthToken();
    
    // Fetch from existing endpoints
    const [modules, categories] = await Promise.all([
      fetch(`${API_BASE}/modules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      fetch(`${API_BASE}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json())
    ]);

    // Calculate metrics from available data
    const moduleData = modules.data || [];
    const categoryData = categories.data || [];

    return {
      totalModules: moduleData.length,
      totalCategories: categoryData.length,
      modulesWithQuizzes: moduleData.filter(m => m.quizzes && m.quizzes.length > 0).length,
      totalQuizzes: moduleData.reduce((sum, m) => sum + (m.quizzes?.length || 0), 0),
      modulesByCategory: categoryData.map(cat => ({
        category: cat.name,
        count: moduleData.filter(m => m.categoryId === cat.id).length
      })),
      recentModules: moduleData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    };
  } catch (error) {
    console.error('Error fetching aggregated analytics:', error);
    return {
      totalModules: 0,
      totalCategories: 0,
      modulesWithQuizzes: 0,
      totalQuizzes: 0,
      modulesByCategory: [],
      recentModules: []
    };
  }
}
