import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants';

// Problems API functions
export const problemsApi = {
  // Get all problems with pagination and filters
  async getProblems(params = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(','));
        } else {
          searchParams.append(key, value);
        }
      }
    });

    const endpoint = searchParams.toString() 
      ? `${API_ENDPOINTS.PROBLEMS.LIST}?${searchParams}`
      : API_ENDPOINTS.PROBLEMS.LIST;
      
    return apiClient.get(endpoint);
  },

  // Get a single problem by slug
  async getProblem(slug) {
    return apiClient.get(API_ENDPOINTS.PROBLEMS.DETAIL(slug));
  },

  // Get visible test cases for a problem
  async getTestCases(slug) {
    return apiClient.get(API_ENDPOINTS.PROBLEMS.TESTCASES(slug));
  },

  // Get a random problem
  async getRandomProblem() {
    return apiClient.get(API_ENDPOINTS.PROBLEMS.RANDOM);
  },

  // Get problems by difficulty
  async getProblemsByDifficulty(difficulty) {
    return apiClient.get(API_ENDPOINTS.PROBLEMS.BY_DIFFICULTY(difficulty));
  },

  // Get problem statistics
  async getProblemStats() {
    return apiClient.get(API_ENDPOINTS.PROBLEMS.STATS);
  },
};

export default problemsApi;