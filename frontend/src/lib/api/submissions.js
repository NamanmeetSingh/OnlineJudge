import { apiClient, compilerClient } from './client';
import { API_ENDPOINTS } from '@/constants';

// Submissions API functions
export const submissionsApi = {
  // Get user submissions with pagination
  async getSubmissions(params = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });

    const endpoint = searchParams.toString() 
      ? `${API_ENDPOINTS.SUBMISSIONS.LIST}?${searchParams}`
      : API_ENDPOINTS.SUBMISSIONS.LIST;
      
    return apiClient.get(endpoint);
  },

  // Get a single submission by ID
  async getSubmission(id) {
    return apiClient.get(API_ENDPOINTS.SUBMISSIONS.DETAIL(id));
  },

  // Create a new submission
  async createSubmission(submissionData) {
    return apiClient.post(API_ENDPOINTS.SUBMISSIONS.CREATE, submissionData);
  },

  // Get user submissions
  async getUserSubmissions(userId, params = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });

    const endpoint = searchParams.toString() 
      ? `${API_ENDPOINTS.SUBMISSIONS.USER(userId)}?${searchParams}`
      : API_ENDPOINTS.SUBMISSIONS.USER(userId);
      
    return apiClient.get(endpoint);
  },
};

// Code execution functions (via backend proxy)
export const executionApi = {
  // Run code with custom input (test run)
  async runCode(codeData) {
    return apiClient.post(API_ENDPOINTS.COMPILER.RUN, codeData);
  },

  // Submit code against test cases
  async submitCode(submissionData) {
    return apiClient.post(API_ENDPOINTS.COMPILER.SUBMIT, submissionData);
  },

  // Get supported languages
  async getSupportedLanguages() {
    return apiClient.get(API_ENDPOINTS.COMPILER.LANGUAGES);
  },

  // Get execution limits
  async getExecutionLimits() {
    return apiClient.get(API_ENDPOINTS.COMPILER.LIMITS);
  },
};

export default submissionsApi;