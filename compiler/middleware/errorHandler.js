/**
 * Error Handling Middleware
 * 
 * Centralized error handling for the code execution server
 */

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('❌ Error:', {
    message: err.message,
    statusCode: err.statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : '🔒 Hidden in production',
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404, 'CAST_ERROR');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400, 'DUPLICATE_FIELD');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // Code execution timeout
  if (err.code === 'EXECUTION_TIMEOUT') {
    error.statusCode = 408;
    error.message = 'Code execution timed out';
  }

  // Memory limit exceeded
  if (err.code === 'MEMORY_LIMIT') {
    error.statusCode = 413;
    error.message = 'Memory limit exceeded during code execution';
  }

  // Compilation errors
  if (err.code === 'COMPILATION_ERROR') {
    error.statusCode = 400;
    error.message = 'Code compilation failed';
  }

  // File system errors
  if (err.code === 'ENOENT' || err.code === 'EACCES') {
    error.statusCode = 500;
    error.message = 'File system error during code execution';
  }

  // Rate limiting
  if (err.statusCode === 429) {
    error.message = 'Too many requests, please try again later';
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Prepare error response
  const errorResponse = {
    success: false,
    error: message,
    statusCode,
    timestamp: new Date().toISOString()
  };

  // Add additional fields based on environment
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      name: err.name,
      code: err.code,
      originalMessage: err.message
    };
  }

  // Add error code if available
  if (error.code) {
    errorResponse.code = error.code;
  }

  // Add request context for debugging
  if (process.env.NODE_ENV === 'development') {
    errorResponse.request = {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Handle async route errors
 */
const handleAsyncError = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error formatter
 */
const formatValidationError = (errors) => {
  if (Array.isArray(errors)) {
    return errors.join('; ');
  }
  
  if (typeof errors === 'object') {
    return Object.values(errors).join('; ');
  }
  
  return errors.toString();
};

/**
 * Create standardized error response
 */
const createErrorResponse = (message, statusCode = 500, code = null, details = null) => {
  const response = {
    success: false,
    error: message,
    statusCode,
    timestamp: new Date().toISOString()
  };

  if (code) {
    response.code = code;
  }

  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }

  return response;
};

/**
 * Log error with context
 */
const logError = (error, context = {}) => {
  const logData = {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    code: error.code,
    timestamp: new Date().toISOString(),
    ...context
  };

  if (error.statusCode >= 500) {
    console.error('🚨 Server Error:', logData);
  } else if (error.statusCode >= 400) {
    console.warn('⚠️  Client Error:', logData);
  } else {
    console.log('ℹ️  Info:', logData);
  }
};

module.exports = {
  AppError,
  notFound,
  errorHandler,
  handleAsyncError,
  formatValidationError,
  createErrorResponse,
  logError
};
