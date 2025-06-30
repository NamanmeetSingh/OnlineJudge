import { API_CONFIG, HTTP_STATUS } from '@/constants';

class ApiClient {
  constructor(baseUrl = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    }
    return {};
  }

  // Helper method to handle responses
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    const data = isJson ? await response.json() : await response.text();
    
    if (!response.ok) {
      const error = new Error(data.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    return data;
  }

  // GET request
  async get(endpoint, options = {}) {
    const { headers = {}, ...otherOptions } = options;
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...headers,
      },
      credentials: 'include',
      ...otherOptions,
    });

    return this.handleResponse(response);
  }

  // POST request
  async post(endpoint, data = null, options = {}) {
    const { headers = {}, ...otherOptions } = options;
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...headers,
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : null,
      ...otherOptions,
    });

    return this.handleResponse(response);
  }

  // PUT request
  async put(endpoint, data = null, options = {}) {
    const { headers = {}, ...otherOptions } = options;
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...headers,
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : null,
      ...otherOptions,
    });

    return this.handleResponse(response);
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    const { headers = {}, ...otherOptions } = options;
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...headers,
      },
      credentials: 'include',  
      ...otherOptions,
    });

    return this.handleResponse(response);
  }
}

// Create instances for different services
export const apiClient = new ApiClient(API_CONFIG.BASE_URL);
export const compilerClient = new ApiClient(API_CONFIG.COMPILER_URL);

// Export for use in other modules
export default apiClient;
