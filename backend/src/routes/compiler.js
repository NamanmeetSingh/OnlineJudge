const express = require('express');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const { validationResult, body } = require('express-validator');

const router = express.Router();

// Compiler service URL
const COMPILER_SERVICE_URL = process.env.COMPILER_SERVICE_URL || 'http://localhost:5001';

// Validation middleware
const executeValidation = [
  body('code').notEmpty().withMessage('Code is required'),
  body('language').isIn(['javascript', 'python', 'java', 'cpp', 'c']).withMessage('Unsupported language'),
  body('input').optional().isString()
];

const submitValidation = [
  body('code').notEmpty().withMessage('Code is required'),
  body('language').isIn(['javascript', 'python', 'java', 'cpp', 'c']).withMessage('Unsupported language'),
  body('problemId').notEmpty().withMessage('Problem ID is required')
];

// Helper function to map compiler service status to database status
const mapSubmissionStatus = (compilerStatus) => {
  const statusMap = {
    'accepted': 'Accepted',
    'wrong_answer': 'Wrong Answer',
    'compilation_error': 'Compilation Error',
    'runtime_error': 'Runtime Error',
    'time_limit_exceeded': 'Time Limit Exceeded',
    'memory_limit_exceeded': 'Memory Limit Exceeded'
  };
  return statusMap[compilerStatus] || 'Internal Error';
};

// Execute code (for testing - Run button)
router.post('/execute', authenticateToken, executeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { code, language, input = '' } = req.body;

    // Call compiler service
    const response = await axios.post(`${COMPILER_SERVICE_URL}/api/compiler/execute`, {
      code,
      language,
      input,
      timeLimit: 10
    }, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      data: response.data.data
    });

  } catch (error) {
    console.error('Code execution error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || 'Code execution failed',
        error: error.response.data.error
      });
    }

    res.status(500).json({
      success: false,
      message: 'Compiler service unavailable',
      error: error.message
    });
  }
});

// Test code against sample test cases (for testing - Enhanced Run button)
router.post('/test-samples', authenticateToken, [
  body('code').notEmpty().withMessage('Code is required'),
  body('language').isIn(['javascript', 'python', 'java', 'cpp', 'c']).withMessage('Unsupported language'),
  body('problemId').notEmpty().withMessage('Problem ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { code, language, problemId } = req.body;

    // Get problem with examples (sample test cases)
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    if (!problem.examples || problem.examples.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No sample test cases available for this problem'
      });
    }

    // Prepare sample test cases for compiler service
    const sampleTestCases = problem.examples.map((example, index) => ({
      input: example.input,
      expectedOutput: example.output,
      testCaseNumber: index + 1
    }));

    const results = [];
    let passedCount = 0;

    // Test each sample case
    for (const testCase of sampleTestCases) {
      try {
        const response = await axios.post(`${COMPILER_SERVICE_URL}/api/compiler/execute`, {
          code,
          language,
          input: testCase.input,
          timeLimit: 10
        }, {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const result = response.data.data;
        const actualOutput = result.output ? result.output.trim() : '';
        const expectedOutput = testCase.expectedOutput ? testCase.expectedOutput.trim() : '';
        const passed = result.status === 'success' && actualOutput === expectedOutput;
        
        if (passed) passedCount++;

        results.push({
          testCaseNumber: testCase.testCaseNumber,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.output,
          passed,
          status: result.status,
          error: result.error,
          executionTime: result.executionTime,
          memoryUsed: result.memoryUsed
        });

      } catch (error) {
        results.push({
          testCaseNumber: testCase.testCaseNumber,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: '',
          passed: false,
          status: 'error',
          error: error.response?.data?.error || error.message,
          executionTime: 0,
          memoryUsed: 0
        });
      }
    }

    res.json({
      success: true,
      data: {
        overallPassed: passedCount === sampleTestCases.length,
        passedCount,
        totalCount: sampleTestCases.length,
        results
      }
    });

  } catch (error) {
    console.error('Sample test execution error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to test sample cases',
      error: error.message
    });
  }
});

// Submit solution (for evaluation - Submit button)
router.post('/submit', authenticateToken, submitValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { code, language, problemId } = req.body;
    const userId = req.user.id;

    // Get problem with test cases
    const problem = await Problem.findById(problemId).select('+testCases');
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Prepare test cases for compiler service
    const testCases = problem.testCases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput
    }));

    // Call compiler service for submission
    const compilerResponse = await axios.post(`${COMPILER_SERVICE_URL}/api/compiler/submit`, {
      code,
      language,
      problemId,
      testCases,
      timeLimit: problem.timeLimit || 10
    }, {
      timeout: 60000, // Longer timeout for submissions
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const submissionResult = compilerResponse.data.data;

    // Save submission to database
    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      status: mapSubmissionStatus(submissionResult.overallResult),
      executionTime: submissionResult.executionTime,
      memoryUsed: submissionResult.memoryUsed,
      testCasesPassed: submissionResult.passedTestCases,
      totalTestCases: submissionResult.totalTestCases,
      testCaseResults: submissionResult.testCaseResults.map(tc => ({
        testCaseId: tc.testCaseNumber,
        status: tc.status === 'passed' ? 'Passed' : 'Failed',
        executionTime: tc.executionTime,
        memoryUsed: tc.memoryUsed,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: tc.actualOutput,
        errorMessage: tc.error
      })),
      compilationError: submissionResult.overallResult === 'compilation_error' ? submissionResult.error : undefined,
      runtimeError: submissionResult.overallResult === 'runtime_error' ? submissionResult.error : undefined
    });

    await submission.save();

    // Update problem statistics
    await Problem.findByIdAndUpdate(problemId, {
      $inc: {
        totalSubmissions: 1,
        ...(submissionResult.overallResult === 'accepted' && { acceptedSubmissions: 1 })
      }
    });

    // Update user statistics if accepted
    if (submissionResult.overallResult === 'accepted') {
      // You can add user statistics update here
    }

    res.json({
      success: true,
      data: {
        submissionId: submission._id,
        status: submissionResult.overallResult,
        executionTime: submissionResult.executionTime,
        memoryUsed: submissionResult.memoryUsed,
        passedTestCases: submissionResult.passedTestCases,
        totalTestCases: submissionResult.totalTestCases,
        testCaseResults: submissionResult.testCaseResults
      }
    });

  } catch (error) {
    console.error('Solution submission error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || 'Solution submission failed',
        error: error.response.data.error
      });
    }

    res.status(500).json({
      success: false,
      message: 'Compiler service unavailable',
      error: error.message
    });
  }
});

// Execute function with sample test cases (LeetCode style - Enhanced Run button)
router.post('/execute-function', authenticateToken, [
  body('code').notEmpty().withMessage('Code is required'),
  body('language').isIn(['javascript', 'python', 'java', 'cpp', 'c']).withMessage('Unsupported language'),
  body('problemId').notEmpty().withMessage('Problem ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { code, language, problemId } = req.body;

    // Get problem with examples (sample test cases)
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    if (!problem.examples || problem.examples.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No sample test cases available for this problem'
      });
    }

    // Prepare sample test cases for function-based execution
    const sampleTestCases = problem.examples.map(example => ({
      input: example.input,
      expectedOutput: example.output
    }));

    // Call function-based compiler service
    const response = await axios.post(`${COMPILER_SERVICE_URL}/api/compiler/execute-function`, {
      code,
      language,
      testCases: sampleTestCases,
      timeLimit: 10
    }, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = response.data.data;

    res.json({
      success: true,
      data: {
        overallPassed: result.passedTestCases === result.totalTestCases,
        passedCount: result.passedTestCases,
        totalCount: result.totalTestCases,
        results: result.testCaseResults,
        executionTime: result.executionTime,
        status: result.overallResult
      }
    });

  } catch (error) {
    console.error('Function execution error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || 'Function execution failed',
        error: error.response.data.error
      });
    }

    res.status(500).json({
      success: false,
      message: 'Compiler service unavailable',
      error: error.message
    });
  }
});

// Submit function-based solution (LeetCode style - Submit button)
router.post('/submit-function', authenticateToken, submitValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { code, language, problemId } = req.body;
    const userId = req.user.id;

    // Get problem with test cases
    const problem = await Problem.findById(problemId).select('+testCases');
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Prepare test cases for function-based execution
    const testCases = problem.testCases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput
    }));

    // Call function-based compiler service
    const compilerResponse = await axios.post(`${COMPILER_SERVICE_URL}/api/compiler/submit-function`, {
      code,
      language,
      problemId,
      testCases,
      timeLimit: problem.timeLimit || 10
    }, {
      timeout: 60000, // Longer timeout for submissions
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const submissionResult = compilerResponse.data.data;

    // Save submission to database
    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      status: mapSubmissionStatus(submissionResult.overallResult),
      executionTime: submissionResult.executionTime,
      memoryUsed: submissionResult.memoryUsed,
      testCasesPassed: submissionResult.passedTestCases,
      totalTestCases: submissionResult.totalTestCases,
      testCaseResults: submissionResult.testCaseResults.map(tc => ({
        testCaseId: tc.testCaseNumber,
        status: tc.status === 'passed' ? 'Passed' : 'Failed',
        executionTime: tc.executionTime,
        memoryUsed: tc.memoryUsed,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: tc.actualOutput,
        errorMessage: tc.error
      })),
      compilationError: submissionResult.overallResult === 'compilation_error' ? submissionResult.error : undefined,
      runtimeError: submissionResult.overallResult === 'runtime_error' ? submissionResult.error : undefined
    });

    await submission.save();

    // Update problem statistics
    await Problem.findByIdAndUpdate(problemId, {
      $inc: {
        totalSubmissions: 1,
        ...(submissionResult.overallResult === 'accepted' && { acceptedSubmissions: 1 })
      }
    });

    res.json({
      success: true,
      data: {
        submissionId: submission._id,
        status: submissionResult.overallResult,
        executionTime: submissionResult.executionTime,
        memoryUsed: submissionResult.memoryUsed,
        passedTestCases: submissionResult.passedTestCases,
        totalTestCases: submissionResult.totalTestCases,
        testCaseResults: submissionResult.testCaseResults
      }
    });

  } catch (error) {
    console.error('Function-based solution submission error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || 'Function-based solution submission failed',
        error: error.response.data.error
      });
    }

    res.status(500).json({
      success: false,
      message: 'Compiler service unavailable',
      error: error.message
    });
  }
});

// Get user submissions for a problem
router.get('/submissions/:problemId', authenticateToken, async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const submissions = await Submission.find({
      userId,
      problemId
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .select('-code -compilerOutput.testCaseResults');

    const totalSubmissions = await Submission.countDocuments({
      userId,
      problemId
    });

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSubmissions / parseInt(limit)),
          totalItems: totalSubmissions,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
});

// Get submission details
router.get('/submission/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const submission = await Submission.findOne({
      _id: id,
      userId
    }).populate('problemId', 'title');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission',
      error: error.message
    });
  }
});

// Get supported languages from compiler service
router.get('/languages', async (req, res) => {
  try {
    const response = await axios.get(`${COMPILER_SERVICE_URL}/api/compiler/languages`, {
      timeout: 5000
    });

    res.json({
      success: true,
      data: response.data.data
    });

  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supported languages',
      error: error.message
    });
  }
});

module.exports = router;
