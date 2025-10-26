import axios from 'axios';

const API_URL = 'http://localhost:3000/api/faqs';

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper to get config with auth header
const getConfig = () => {
  const token = getAuthToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Get all FAQs (public)
export const getAllFAQs = async (category = null, isActive = null) => {
  try {
    const params = {};
    if (category) params.category = category;
    if (isActive !== null) params.isActive = isActive;

    const response = await axios.get(API_URL, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get FAQs by category (public)
export const getFAQsByCategory = async (category) => {
  try {
    const response = await axios.get(`${API_URL}/category/${category}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get FAQ by ID (public)
export const getFAQById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create FAQ (admin only)
export const createFAQ = async (faqData) => {
  try {
    const response = await axios.post(API_URL, faqData, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update FAQ (admin only)
export const updateFAQ = async (id, faqData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, faqData, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete FAQ (admin only)
export const deleteFAQ = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
