/**
 * Logging Middleware
 * 
 * Provides request logging and monitoring capabilities
 */

/**
 * Request logger middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const { method, url, ip, headers } = req;
  
  // Get user agent for monitoring
  const userAgent = headers['user-agent'] || 'Unknown';
  
  // Log request start
  console.log(`📝 ${method} ${url} - ${ip} - ${new Date().toISOString()}`);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const { statusCode } = res;
    
    // Log response
    const statusIcon = statusCode >= 400 ? '❌' : statusCode >= 300 ? '⚠️' : '✅';
    console.log(`${statusIcon} ${method} ${url} - ${statusCode} - ${duration}ms`);
    
    // Log additional details for errors or slow requests
    if (statusCode >= 400 || duration > 5000) {
      console.log(`📊 Details: ${ip} - ${userAgent.substring(0, 50)}`);
    }
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Security logger for suspicious activities
 */
const securityLogger = (req, res, next) => {
  const { method, url, ip, headers, body } = req;
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//g,  // Path traversal
    /<script/gi, // XSS attempts
    /union.*select/gi, // SQL injection
    /exec\s*\(/gi, // Code injection
    /system\s*\(/gi, // System calls
  ];
  
  const requestString = JSON.stringify({ url, body });
  const foundSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestString));
  
  if (foundSuspicious) {
    console.warn('🚨 SECURITY ALERT:', {
      ip,
      method,
      url,
      userAgent: headers['user-agent'],
      timestamp: new Date().toISOString(),
      suspicious: 'Potentially malicious request detected'
    });
  }
  
  next();
};

/**
 * Performance logger for monitoring slow operations
 */
const performanceLogger = (threshold = 1000) => {
  return (req, res, next) => {
    const startTime = process.hrtime.bigint();
    
    // Override res.end to measure performance
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      
      if (duration > threshold) {
        console.warn('🐌 SLOW REQUEST:', {
          method: req.method,
          url: req.url,
          duration: `${duration.toFixed(2)}ms`,
          timestamp: new Date().toISOString()
        });
      }
      
      originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
};

/**
 * Code execution logger for monitoring code execution activities
 */
const codeExecutionLogger = (req, res, next) => {
  if (req.url.includes('/execute/')) {
    const { language, code } = req.body || {};
    
    console.log('🔧 CODE EXECUTION REQUEST:', {
      endpoint: req.url,
      language: language || 'unknown',
      codeLength: code ? code.length : 0,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    // Log the first few lines of code for debugging (in development only)
    if (process.env.NODE_ENV === 'development' && code) {
      const preview = code.split('\n').slice(0, 3).join('\n');
      console.log('📝 Code preview:', preview.substring(0, 100) + '...');
    }
  }
  
  next();
};

/**
 * Error logger for detailed error tracking
 */
const errorLogger = (err, req, res, next) => {
  console.error('❌ ERROR DETAILS:', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    body: req.body,
    timestamp: new Date().toISOString()
  });
  
  next(err);
};

module.exports = {
  requestLogger,
  securityLogger,
  performanceLogger,
  codeExecutionLogger,
  errorLogger
};
