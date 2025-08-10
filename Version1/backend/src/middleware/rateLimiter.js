const rateLimit = require('express-rate-limit');

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
});

// Rate limiting for submission routes
const submissionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 submissions per minute
  message: {
    success: false,
    message: 'Too many submissions, please wait before submitting again'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset attempts per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for email verification
const emailVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 email verification requests per 5 minutes
  message: {
    success: false,
    message: 'Too many email verification requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for discussion posts
const discussionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 5 discussion posts per 5 minutes
  message: {
    success: false,
    message: 'Too many discussion posts, please wait before posting again'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for contest registration
const contestRegistrationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 contest registrations per minute
  message: {
    success: false,
    message: 'Too many contest registration attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Custom rate limiter factory for dynamic limits
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
      success: false,
      message: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
  };
  
  return rateLimit({ ...defaultOptions, ...options });
};

module.exports = {
  apiLimiter,
  authLimiter,
  submissionLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  discussionLimiter,
  contestRegistrationLimiter,
  createRateLimiter
};
