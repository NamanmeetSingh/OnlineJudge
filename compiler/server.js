const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const codeExecutionRoutes = require('./routes/execution');
const { errorHandler, notFound } = require('./middleware/errorHandler');

/**
 * Online Judge Code Execution Server
 */

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * Helmet - Sets various HTTP headers to secure the app
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

/**
 * CORS - Configure Cross-Origin Resource Sharing
 * Allow requests from your main backend server
 */
app.use(cors({
  origin: [
    'http://localhost:3000',  
    'http://localhost:3002',  
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.BACKEND_URL || 'http://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

/**
 * Rate Limiting - Prevent abuse and DOS attacks
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const executionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, 
  message: {
    error: 'Too many code execution requests, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/execute/', executionLimiter);

/**
 * Body parsing middleware
 */
app.use(express.json({ 
  limit: '1mb',  
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb' 
}));

/**
 * Security headers for all responses
 */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

/**
 * Code execution routes (main functionality)
 */
app.use('/api/execute', codeExecutionRoutes);

/**
 * Root endpoint - API information
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Online Judge Code Execution Server',
    version: '1.0.0',
    endpoints: {
      run: '/api/execute/run',
      submit: '/api/execute/submit',
      languages: '/api/execute/languages',
      limits: '/api/execute/limits'
    }
  });
});

/**
 * API root endpoint
 */
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Online Judge Code Execution API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * 404 handler for unknown routes
 */
app.use(notFound);

/**
 * Global error handler
 */
app.use(errorHandler);

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (signal) => {
  server.close(() => {
    process.exit(0);
  });
  
  setTimeout(() => {
    process.exit(1);
  }, 10000);
};

/**
 * Start the server
 */
const server = app.listen(PORT);

/**
 * Handle graceful shutdown
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  gracefulShutdown('uncaughtException');
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  gracefulShutdown('unhandledRejection');
});

module.exports = app;
