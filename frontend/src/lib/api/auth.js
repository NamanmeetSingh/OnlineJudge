import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants';

// Authentication API functions  
export const authApi = {
  // Register a new user
  async register(userData) {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  },

  // Login user
  async login(credentials) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Store token in localStorage if provided
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response;
  },

  // Logout user
  async logout() {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
    }
  },
  // Get user profile
  async getProfile() {
    return apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
  },

  // Update user profile
  async updateProfile(profileData) {
    return apiClient.put(API_ENDPOINTS.AUTH.PROFILE, profileData);
  },

  // Initiate Google OAuth
  getGoogleAuthUrl() {
    return `${apiClient.baseUrl}${API_ENDPOINTS.AUTH.GOOGLE}`;
  },

  // Check if user is authenticated
  isAuthenticated() {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  },

  // Get stored token
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  // Get dashboard data
  async getDashboard() {
    return apiClient.get('/auth/dashboard');
  },
};

// User API functions
export const userApi = {
  // Get user profile
  async getProfile() {
    return apiClient.get(API_ENDPOINTS.USER.PROFILE);
  },

  // Get user progress
  async getProgress() {
    return apiClient.get(API_ENDPOINTS.USER.PROGRESS);
  },

  // Update user profile
  async updateProfile(profileData) {
    return apiClient.put(API_ENDPOINTS.USER.PROFILE, profileData);
  },
};

export default authApi;
