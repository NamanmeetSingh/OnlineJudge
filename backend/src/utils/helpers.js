// Utility functions for the online judge platform

/**
 * Generate a unique slug from a string
 * @param {string} text - The text to convert to slug
 * @param {string} suffix - Optional suffix to add for uniqueness
 * @returns {string} - The generated slug
 */
const generateSlug = (text, suffix = '') => {
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  if (suffix) {
    slug += `-${suffix}`;
  }
  
  return slug;
};

/**
 * Calculate Wilson score for sorting by rating
 * @param {number} positive - Number of positive votes/likes
 * @param {number} total - Total number of votes
 * @param {number} confidence - Confidence level (default 0.95)
 * @returns {number} - Wilson score
 */
const wilsonScore = (positive, total, confidence = 0.95) => {
  if (total === 0) return 0;
  
  const z = getZScore(confidence);
  const p = positive / total;
  const n = total;
  
  return (p + z * z / (2 * n) - z * Math.sqrt((p * (1 - p) + z * z / (4 * n)) / n)) / (1 + z * z / n);
};

/**
 * Get Z-score for confidence level
 * @param {number} confidence - Confidence level
 * @returns {number} - Z-score
 */
const getZScore = (confidence) => {
  const confidenceMap = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576
  };
  
  return confidenceMap[confidence] || 1.96;
};

/**
 * Format time duration
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} - Formatted duration string
 */
const formatDuration = (milliseconds) => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Format memory size
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size string
 */
const formatMemory = (bytes) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)}${units[unitIndex]}`;
};

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @param {string} charset - Character set to use
 * @returns {string} - Random string
 */
const generateRandomString = (length = 10, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to check
 * @returns {boolean} - Whether the ID is valid
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Sanitize HTML content
 * @param {string} html - HTML content to sanitize
 * @returns {string} - Sanitized HTML
 */
const sanitizeHtml = (html) => {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
};

/**
 * Calculate rating change for contest participants
 * @param {number} rank - User's rank in contest
 * @param {number} oldRating - User's current rating
 * @param {number} performanceRating - Performance rating in contest
 * @returns {number} - Rating change
 */
const calculateRatingChange = (rank, oldRating, performanceRating) => {
  // Simplified ELO-based rating calculation
  const K = 32; // K-factor
  const expectedScore = 1 / (1 + Math.pow(10, (performanceRating - oldRating) / 400));
  const actualScore = rank <= 1 ? 1 : 1 / rank;
  
  return Math.round(K * (actualScore - expectedScore));
};

/**
 * Paginate array
 * @param {Array} array - Array to paginate
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @returns {Object} - Pagination result
 */
const paginate = (array, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const paginatedItems = array.slice(offset, offset + limit);
  const totalPages = Math.ceil(array.length / limit);
  
  return {
    data: paginatedItems,
    pagination: {
      page,
      limit,
      total: array.length,
      pages: totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
};

module.exports = {
  generateSlug,
  wilsonScore,
  getZScore,
  formatDuration,
  formatMemory,
  generateRandomString,
  isValidObjectId,
  sanitizeHtml,
  calculateRatingChange,
  paginate,
  debounce,
  deepClone
};
