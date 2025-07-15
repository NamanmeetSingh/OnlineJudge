const winston = require('winston');

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log' })
  ]
});

const errorHandler = (error, req, res, next) => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const response = {
    success: false,
    message: error.message || 'Internal server error',
    ...(isDevelopment && { stack: error.stack })
  };

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      ...response,
      message: 'Validation failed',
      details: error.details
    });
  }

  if (error.code === 'ENOENT') {
    return res.status(404).json({
      ...response,
      message: 'Resource not found'
    });
  }

  if (error.code === 'EACCES') {
    return res.status(403).json({
      ...response,
      message: 'Permission denied'
    });
  }

  if (error.name === 'TimeoutError') {
    return res.status(408).json({
      ...response,
      message: 'Request timeout'
    });
  }

  // Default to 500 server error
  res.status(500).json(response);
};

module.exports = { errorHandler };
