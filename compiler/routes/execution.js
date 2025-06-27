const express = require('express');
const { CodeRunner, EXECUTION_STATUS, LANGUAGE_CONFIG } = require('../core/codeRunner');
const { validateCodeExecution, validateTestCases } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

/**
 * Code Execution Routes
 * 
 * This module handles all code execution related endpoints:
 * - /run - Execute code with custom input (Run button functionality)
 * - /submit - Execute code against test cases (Submit button functionality)
 * - /languages - Get supported languages and their configurations
 * - /limits - Get execution limits and constraints
 */

// =============================================================================
// CODE EXECUTION ENDPOINTS
// =============================================================================

/**
 * POST /api/execute/run
 * 
 * Execute user code with custom input (Run button functionality)
 * This endpoint is used when users want to test their code with sample input
 * 
 * @body {string} code - Source code to execute
 * @body {string} language - Programming language (c, cpp, python, javascript)
 * @body {string} [stdin] - Optional input to provide to the program
 * @body {number} [timeoutMs] - Optional custom timeout (max 10000ms)
 */
router.post('/run', validateCodeExecution, asyncHandler(async (req, res) => {
  const { code, language, stdin, timeoutMs } = req.body;
  
  // Initialize code runner
  const runner = new CodeRunner();
  
  // Set custom timeout if provided (with maximum limit)
  const timeout = timeoutMs ? Math.min(timeoutMs, 10000) : undefined;
  
  // Execute the code
  const startTime = Date.now();
  const result = await runner.runCode(code, language.toLowerCase(), stdin || '', timeout);
  const totalTime = Date.now() - startTime;
  
  // Return execution results
  res.json({
    success: true,
    data: {
      status: result.status,
      output: result.stdout,
      error: result.stderr,
      executionTime: result.executionTime,
      compilationTime: result.compilationTime,
      totalTime,
      language: language.toLowerCase(),
      message: getStatusMessage(result.status)
    },
    timestamp: new Date().toISOString()
  });
}));

/**
 * POST /api/execute/submit
 * 
 * Execute code against multiple test cases (Submit button functionality)
 * This endpoint determines the final verdict (Accepted, Wrong Answer, etc.)
 * 
 * @body {string} code - Source code to test
 * @body {string} language - Programming language
 * @body {Array} testCases - Array of test case objects with input and expectedOutput
 * @body {string} [problemId] - Optional problem identifier for logging
 * @body {boolean} [stopOnFirstFailure] - Stop execution on first failed test case (default: true)
 */
router.post('/submit', validateTestCases, asyncHandler(async (req, res) => {
  const { code, language, testCases, problemId, stopOnFirstFailure = true } = req.body;
    // Initialize code runner
  const runner = new CodeRunner();
  
  // Configure runner for submit mode
  runner.stopOnFirstFailure = stopOnFirstFailure;
  
  // Execute against all test cases
  const startTime = Date.now();
  const result = await runner.runTests(code, language.toLowerCase(), testCases);
  const totalTime = Date.now() - startTime;
  
  // Prepare detailed response
  const response = {
    success: true,
    data: {
      verdict: result.status,
      status: result.status, // For backward compatibility
      passedTests: result.passedTests,
      totalTests: result.totalTests,
      totalExecutionTime: result.totalExecutionTime,
      compilationTime: result.compilationTime,
      totalTime,
      language: language.toLowerCase(),
      message: getStatusMessage(result.status),
      
      // Test case details (limited in production for security)
      testResults: process.env.NODE_ENV === 'development' 
        ? result.results 
        : result.results.map((test, index) => ({
            testCase: index + 1,
            status: test.status,
            executionTime: test.executionTime,
            // Hide actual input/output in production
            ...(test.status !== EXECUTION_STATUS.ACCEPTED && {
              hint: `Test case ${index + 1} failed`
            })
          }))
    },
    metadata: {
      problemId: problemId || null,
      timestamp: new Date().toISOString(),
      stopOnFirstFailure
    }
  };
  
  res.json(response);
}));

// =============================================================================
// INFORMATION ENDPOINTS
// =============================================================================

/**
 * GET /api/execute/languages
 * 
 * Get list of supported programming languages and their configurations
 */
router.get('/languages', asyncHandler(async (req, res) => {
  const languages = Object.keys(LANGUAGE_CONFIG).map(lang => {
    const config = LANGUAGE_CONFIG[lang];
    return {
      name: lang,
      extension: config.extension,
      needsCompilation: config.needsCompilation,
      compiler: config.compileCommand || null,
      interpreter: config.runCommand || null,
      defaultTimeout: config.timeoutMs,
      displayName: getLanguageDisplayName(lang)
    };
  });
  
  res.json({
    success: true,
    data: {
      supportedLanguages: languages,
      total: languages.length
    },
    timestamp: new Date().toISOString()
  });
}));

/**
 * GET /api/execute/limits
 * 
 * Get execution limits and constraints
 */
router.get('/limits', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      maxExecutionTime: 10000, // 10 seconds maximum
      defaultExecutionTime: 5000, // 5 seconds default
      maxCodeSize: 1024 * 1024, // 1MB max code size
      maxStdinSize: 64 * 1024, // 64KB max input size
      maxTestCases: 100, // Maximum test cases per submission
      supportedLanguages: Object.keys(LANGUAGE_CONFIG),
      rateLimits: {
        requestsPerMinute: 10,
        requestsPer15Minutes: 100
      }
    },
    timestamp: new Date().toISOString()
  });
}));

/**
 * GET /api/execute/status/:executionId
 * 
 * Get status of a long-running execution (future enhancement)
 * Currently returns not implemented
 */
router.get('/status/:executionId', asyncHandler(async (req, res) => {
  const { executionId } = req.params;
  
  // This is a placeholder for future async execution tracking
  res.status(501).json({
    success: false,
    error: 'Async execution tracking not yet implemented',
    executionId,
    message: 'All executions are currently synchronous'
  });
}));

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get user-friendly status messages
 * @param {string} status - Execution status from CodeRunner
 * @returns {string} User-friendly message
 */
function getStatusMessage(status) {
  const messages = {
    [EXECUTION_STATUS.SUCCESS]: 'Code executed successfully',
    [EXECUTION_STATUS.ACCEPTED]: 'Accepted! All test cases passed',
    [EXECUTION_STATUS.WRONG_ANSWER]: 'Wrong Answer - Output does not match expected result',
    [EXECUTION_STATUS.COMPILE_ERROR]: 'Compilation Error - Please check your syntax',
    [EXECUTION_STATUS.RUNTIME_ERROR]: 'Runtime Error - Your program crashed during execution',
    [EXECUTION_STATUS.TIME_LIMIT_EXCEEDED]: 'Time Limit Exceeded - Your program took too long to execute',
    [EXECUTION_STATUS.MEMORY_LIMIT_EXCEEDED]: 'Memory Limit Exceeded - Your program used too much memory'
  };

  return messages[status] || `Unknown status: ${status}`;
}

/**
 * Get display name for programming languages
 * @param {string} lang - Language identifier
 * @returns {string} Display name
 */
function getLanguageDisplayName(lang) {
  const displayNames = {
    'c': 'C',
    'cpp': 'C++',
    'python': 'Python',
    'javascript': 'JavaScript (Node.js)'
  };

  return displayNames[lang] || lang.toUpperCase();
}

module.exports = router;
