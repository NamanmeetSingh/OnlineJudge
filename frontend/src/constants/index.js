// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  COMPILER_URL: process.env.NEXT_PUBLIC_COMPILER_URL || 'http://localhost:3001',
  TIMEOUT: 30000,
};

// API Endpoints
export const API_ENDPOINTS = {  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GOOGLE: '/auth/google',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/me',
    VERIFY: '/auth/verify',
  },
  
  // Problems
  PROBLEMS: {
    LIST: '/api/problems',
    DETAIL: (slug) => `/api/problems/${slug}`,
    RANDOM: '/api/problems/random',
    STATS: '/api/problems/stats',
    TESTCASES: (slug) => `/api/problems/${slug}/testcases`,
    BY_DIFFICULTY: (difficulty) => `/api/problems/difficulty/${difficulty}`,
  },
  
  // Submissions
  SUBMISSIONS: {
    LIST: '/api/submissions',
    CREATE: '/api/submissions',
    DETAIL: (id) => `/api/submissions/${id}`,
    USER: (userId) => `/api/submissions/user/${userId}`,
  },
  
  // Code Execution
  COMPILER: {
    RUN: '/api/compiler/run',
    SUBMIT: '/api/compiler/submit',
    LANGUAGES: '/api/compiler/languages',
    LIMITS: '/api/compiler/limits',
  },
  
  // User & Profile
  USER: {
    PROFILE: '/api/user/profile',
    PROGRESS: '/api/user/progress',
    LEADERBOARD: '/api/leaderboard',
  },
  
  // Discussions
  DISCUSSIONS: {
    LIST: '/api/discussions',
    CREATE: '/api/discussions',
    DETAIL: (id) => `/api/discussions/${id}`,
  },
  
  // Admin
  ADMIN: {
    PROBLEMS: '/admin/problems',
    USERS: '/admin/users',
    SUBMISSIONS: '/admin/submissions',
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Problem Difficulties
export const DIFFICULTIES = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

// Programming Languages
export const LANGUAGES = {
  JAVASCRIPT: 'javascript',
  PYTHON: 'python', 
  CPP: 'cpp',
  C: 'c',
  JAVA: 'java',
};

// Submission Status
export const SUBMISSION_STATUS = {
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong Answer',
  TIME_LIMIT_EXCEEDED: 'Time Limit Exceeded',
  MEMORY_LIMIT_EXCEEDED: 'Memory Limit Exceeded',
  RUNTIME_ERROR: 'Runtime Error',
  COMPILATION_ERROR: 'Compilation Error',
  PENDING: 'Pending',
  RUNNING: 'Running',
};