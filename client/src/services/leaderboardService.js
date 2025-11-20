import axios from 'axios';

const API_URL = 'http://localhost:3000/api/analytics';

/**
 * Get leaderboard data
 * @param {string} timeFrame - 'all-time', 'month', or 'year'
 * @param {number} limit - number of results to return
 */
export const getLeaderboard = async (timeFrame = 'all-time', limit = 50) => {
  try {
    const response = await axios.get(`${API_URL}/leaderboard`, {
      params: { timeFrame, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
