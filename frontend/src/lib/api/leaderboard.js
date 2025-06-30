import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants';

// Leaderboard API functions
export const leaderboardApi = {
  // Get leaderboard data
  async getLeaderboard(params = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });

    const endpoint = searchParams.toString() 
      ? `${API_ENDPOINTS.USER.LEADERBOARD}?${searchParams}`
      : API_ENDPOINTS.USER.LEADERBOARD;
      
    return apiClient.get(endpoint);
  },

  // Get user ranking
  async getUserRank(userId) {
    return apiClient.get(`${API_ENDPOINTS.USER.LEADERBOARD}/rank/${userId}`);
  },
};

// Discussions API functions
export const discussionsApi = {
  // Get all discussions
  async getDiscussions(params = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });

    const endpoint = searchParams.toString() 
      ? `${API_ENDPOINTS.DISCUSSIONS.LIST}?${searchParams}`
      : API_ENDPOINTS.DISCUSSIONS.LIST;
      
    return apiClient.get(endpoint);
  },

  // Get a single discussion
  async getDiscussion(id) {
    return apiClient.get(API_ENDPOINTS.DISCUSSIONS.DETAIL(id));
  },

  // Create a new discussion
  async createDiscussion(discussionData) {
    return apiClient.post(API_ENDPOINTS.DISCUSSIONS.CREATE, discussionData);
  },

  // Update discussion
  async updateDiscussion(id, discussionData) {
    return apiClient.put(API_ENDPOINTS.DISCUSSIONS.DETAIL(id), discussionData);
  },

  // Delete discussion
  async deleteDiscussion(id) {
    return apiClient.delete(API_ENDPOINTS.DISCUSSIONS.DETAIL(id));
  },
};

export default leaderboardApi;