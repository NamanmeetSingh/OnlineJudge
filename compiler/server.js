const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const codeExecutionRoutes = require('./routes/execution');
const healthRoutes = require('./routes/health');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');

/**
 * Online Judge Code Execution Server
 * 
 * A standalone Express.js server that handles code compilation and execution
 * for an Online Judge platform. This server is designed to be isolated from
 * the main backend for security and scalability reasons.
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
    'http://localhost:3000',  // Main backend server
    'http://localhost:3002',  // Frontend development server
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.BACKEND_URL || 'http://localhost:3000'
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
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const executionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 code executions per minute
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
  limit: '1mb',  // Limit request size to prevent large code submissions
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb' 
}));

/**
 * Request logging middleware
 */
app.use(requestLogger);

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

// =============================================================================
// ROUTES
// =============================================================================

/**
 * Health check and system status routes
 */
app.use('/api/health', healthRoutes);

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
      health: '/api/health',
      run: '/api/execute/run',
      submit: '/api/execute/submit',
      languages: '/api/execute/languages',
      limits: '/api/execute/limits'
    },
    documentation: 'See README.md for detailed API documentation'
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
    timestamp: new Date().toISOString(),
    server: {
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }
  });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * 404 handler for unknown routes
 */
app.use(notFound);

/**
 * Global error handler
 */
app.use(errorHandler);

// =============================================================================
// SERVER STARTUP
// =============================================================================

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (signal) => {
  console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('✅ HTTP server closed.');
    
    // Add cleanup for any ongoing code executions here
    // For example, kill any running processes, cleanup temp files, etc.
    
    console.log('🔄 Cleanup completed.');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

/**
 * Start the server
 */
const server = app.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log('🚀 Online Judge Compiler Server');
  console.log('🚀 ================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}/`);
  console.log('🚀 ================================');
  
  // Log supported languages
  const { LANGUAGE_CONFIG } = require('./core/codeRunner');
  const languages = Object.keys(LANGUAGE_CONFIG);
  console.log(`📝 Supported Languages: ${languages.join(', ')}`);
  
  console.log('✅ Server ready to handle code execution requests!');
});

/**
 * Handle graceful shutdown
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = app;
