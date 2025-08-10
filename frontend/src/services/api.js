const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  // Helper method to get headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Helper method to handle responses
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  }

  // Update token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Remove token
  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Auth endpoints
  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(userData),
    });
    
    return this.handleResponse(response);
  }

  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(credentials),
    });
    
    return this.handleResponse(response);
  }

  async getMe() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async updateProfile(profileData) {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(profileData),
    });
    
    return this.handleResponse(response);
  }

  async changePassword(passwordData) {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(passwordData),
    });
    
    return this.handleResponse(response);
  }

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }

  // Users endpoints
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/users?${queryString}`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    
    return this.handleResponse(response);
  }

  async getUserById(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    
    return this.handleResponse(response);
  }

  async getUserProfile(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    
    return this.handleResponse(response);
  }

  async getUserSubmissions(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/users/${userId}/submissions?${queryString}`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    
    return this.handleResponse(response);
  }

  async getLeaderboard(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/users/leaderboard?${queryString}`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    
    return this.handleResponse(response);
  }

  async getUserStats() {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    
    return this.handleResponse(response);
  }

  async searchUsers(query, limit = 10) {
    const params = new URLSearchParams({ q: query, limit }).toString();
    const response = await fetch(`${API_BASE_URL}/users/search?${params}`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    
    return this.handleResponse(response);
  }

  // Problems endpoints
  async getProblems(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/problems?${queryString}`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    
    return this.handleResponse(response);
  }

  async getProblemById(problemId) {
    const response = await fetch(`${API_BASE_URL}/problems/${problemId}`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    
    return this.handleResponse(response);
  }

  // Submissions endpoints
  async getSubmissions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/submissions?${queryString}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async submitCode(submissionData) {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(submissionData),
    });
    
    return this.handleResponse(response);
  }

  // Contests endpoints (placeholder)
  async getContests(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/contests?${queryString}`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    
    return this.handleResponse(response);
  }

  async getContestById(contestId) {
    const response = await fetch(`${API_BASE_URL}/contests/${contestId}`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    
    return this.handleResponse(response);
  }

  // Discussions endpoints (placeholder)
  async getDiscussions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/discussions?${queryString}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async getDiscussionById(discussionId) {
    const response = await fetch(`${API_BASE_URL}/discussions/${discussionId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }

  // Gemini-based code execution endpoints
  async executeCode(codeData) {
    const response = await fetch(`${API_BASE_URL}/problems/${codeData.problemId}/run`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        code: codeData.code,
        language: codeData.language,
        input: codeData.input
      }),
    });
    
    return this.handleResponse(response);
  }

  async testSampleCases(testData) {
    // This is now handled by executeFunctionCode for sample test cases
    return this.executeFunctionCode(testData);
  }

  async submitSolution(submissionData) {
    const response = await fetch(`${API_BASE_URL}/submissions/submit`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(submissionData),
    });
    
    return this.handleResponse(response);
  }

  async getSupportedLanguages() {
    // Return supported languages directly since we're not using compiler service
    return {
      success: true,
      data: [
        { name: 'python', displayName: 'Python' },
        { name: 'javascript', displayName: 'JavaScript' },
        { name: 'java', displayName: 'Java' },
        { name: 'cpp', displayName: 'C++' },
        { name: 'c', displayName: 'C' }
      ]
    };
  }

  async getUserSubmissionsForProblem(problemId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/submissions/problem/${problemId}?${queryString}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }

  // Function-based execution (LeetCode style) using Gemini API
  async executeFunctionCode(codeData) {
    const response = await fetch(`${API_BASE_URL}/submissions/execute-function`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(codeData),
    });
    
    return this.handleResponse(response);
  }

  async submitFunctionSolution(submissionData) {
    const response = await fetch(`${API_BASE_URL}/submissions/submit-function`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(submissionData),
    });
    
    return this.handleResponse(response);
  }

  async getSubmissionDetails(submissionId) {
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }

  // AI endpoints
  async getAIAssistance(assistanceData) {
    const response = await fetch(`${API_BASE_URL}/ai/assist`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(assistanceData),
    });
    
    return this.handleResponse(response);
  }

  async getAISuggestions(suggestionData) {
    const response = await fetch(`${API_BASE_URL}/ai/suggest`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(suggestionData),
    });
    
    return this.handleResponse(response);
  }

  async getCodeExplanation(explanationData) {
    const response = await fetch(`${API_BASE_URL}/ai/explain`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(explanationData),
    });
    
    return this.handleResponse(response);
  }
}

export default new ApiService();
