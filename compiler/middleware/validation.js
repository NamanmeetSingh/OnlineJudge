const { LANGUAGE_CONFIG } = require('../core/codeRunner');

/**
 * Validation Middleware
 * 
 * Contains validation functions for request data to ensure
 * proper input format and security constraints
 */

/**
 * Validate code execution request (for /run endpoint)
 */
const validateCodeExecution = (req, res, next) => {
  const { code, language, stdin, timeoutMs } = req.body;
  const errors = [];

  // Validate required fields
  if (!code || typeof code !== 'string') {
    errors.push('Code is required and must be a string');
  }

  if (!language || typeof language !== 'string') {
    errors.push('Language is required and must be a string');
  }

  // Validate language support
  if (language && !LANGUAGE_CONFIG[language.toLowerCase()]) {
    const supportedLanguages = Object.keys(LANGUAGE_CONFIG).join(', ');
    errors.push(`Unsupported language: ${language}. Supported languages: ${supportedLanguages}`);
  }

  // Validate code size (1MB limit)
  if (code && code.length > 1024 * 1024) {
    errors.push('Code size exceeds 1MB limit');
  }

  // Validate stdin size (64KB limit)
  if (stdin && typeof stdin === 'string' && stdin.length > 64 * 1024) {
    errors.push('Input size exceeds 64KB limit');
  }

  // Validate timeout
  if (timeoutMs !== undefined) {
    if (typeof timeoutMs !== 'number' || timeoutMs < 1000 || timeoutMs > 10000) {
      errors.push('Timeout must be between 1000ms and 10000ms');
    }
  }

  // Validate stdin type
  if (stdin !== undefined && typeof stdin !== 'string') {
    errors.push('Input (stdin) must be a string');
  }  // Check for potentially dangerous code patterns (only for obvious malicious patterns)
  const dangerousPatterns = [
    /import\s+os.*system/i,  // Only flag os.system, not just os import
    /require\s*\(\s*['"]fs['"]\s*\).*unlink/i,  // Only flag file deletion
    /require\s*\(\s*['"]child_process['"]\s*\).*exec/i,  // Only flag process execution
    /subprocess.*shell\s*=\s*True/i,  // Only flag shell execution in subprocess
    /eval\s*\(\s*input\s*\(/i,  // Only flag eval with user input
    /exec\s*\(\s*input\s*\(/i   // Only flag exec with user input
  ];

  if (code) {
    const foundDangerous = dangerousPatterns.some(pattern => pattern.test(code));
    if (foundDangerous) {
      errors.push('Code contains potentially dangerous operations');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * Validate test cases for submission (for /submit endpoint)
 */
const validateTestCases = (req, res, next) => {
  const { code, language, testCases, problemId, stopOnFirstFailure } = req.body;
  const errors = [];

  // Validate required fields
  if (!code || typeof code !== 'string') {
    errors.push('Code is required and must be a string');
  }

  if (!language || typeof language !== 'string') {
    errors.push('Language is required and must be a string');
  }

  if (!testCases || !Array.isArray(testCases)) {
    errors.push('Test cases are required and must be an array');
  }

  // Validate language support
  if (language && !LANGUAGE_CONFIG[language.toLowerCase()]) {
    const supportedLanguages = Object.keys(LANGUAGE_CONFIG).join(', ');
    errors.push(`Unsupported language: ${language}. Supported languages: ${supportedLanguages}`);
  }

  // Validate code size
  if (code && code.length > 1024 * 1024) {
    errors.push('Code size exceeds 1MB limit');
  }

  // Validate test cases
  if (testCases) {
    if (testCases.length === 0) {
      errors.push('At least one test case is required');
    }

    if (testCases.length > 100) {
      errors.push('Maximum 100 test cases allowed');
    }

    testCases.forEach((testCase, index) => {
      if (!testCase || typeof testCase !== 'object') {
        errors.push(`Test case ${index + 1} must be an object`);
        return;
      }

      if (!testCase.hasOwnProperty('input') || typeof testCase.input !== 'string') {
        errors.push(`Test case ${index + 1} must have an 'input' string field`);
      }

      if (!testCase.hasOwnProperty('expectedOutput') || typeof testCase.expectedOutput !== 'string') {
        errors.push(`Test case ${index + 1} must have an 'expectedOutput' string field`);
      }

      // Validate input size
      if (testCase.input && testCase.input.length > 64 * 1024) {
        errors.push(`Test case ${index + 1} input exceeds 64KB limit`);
      }

      // Validate expected output size
      if (testCase.expectedOutput && testCase.expectedOutput.length > 64 * 1024) {
        errors.push(`Test case ${index + 1} expected output exceeds 64KB limit`);
      }
    });
  }

  // Validate optional fields
  if (problemId !== undefined && typeof problemId !== 'string') {
    errors.push('Problem ID must be a string');
  }

  if (stopOnFirstFailure !== undefined && typeof stopOnFirstFailure !== 'boolean') {
    errors.push('stopOnFirstFailure must be a boolean');
  }  // Check for dangerous code patterns
  const dangerousPatterns = [
    /import\s+os.*system/i,  // Only flag os.system, not just os import
    /require\s*\(\s*['"]fs['"]\s*\).*unlink/i,  // Only flag file deletion
    /require\s*\(\s*['"]child_process['"]\s*\).*exec/i,  // Only flag process execution
    /subprocess.*shell\s*=\s*True/i,  // Only flag shell execution in subprocess
    /eval\s*\(\s*input\s*\(/i,  // Only flag eval with user input
    /exec\s*\(\s*input\s*\(/i   // Only flag exec with user input
  ];

  if (code) {
    const foundDangerous = dangerousPatterns.some(pattern => pattern.test(code));
    if (foundDangerous) {
      errors.push('Code contains potentially dangerous operations');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * Validate request body size
 */
const validateRequestSize = (maxSize = 2 * 1024 * 1024) => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length'));
    
    if (contentLength && contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        error: 'Request body too large',
        maxSize: `${maxSize / (1024 * 1024)}MB`,
        timestamp: new Date().toISOString()
      });
    }
    
    next();
  };
};

/**
 * Sanitize input to prevent injection attacks
 */
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Remove null bytes and other control characters (except newlines and tabs)
    return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'string') {
          sanitized[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitized[key] = sanitizeObject(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
    }
    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
};

module.exports = {
  validateCodeExecution,
  validateTestCases,
  validateRequestSize,
  sanitizeInput
};
