const express = require('express');
const { CodeRunner, EXECUTION_STATUS } = require('../compiler');
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const Submission = require('../models/Submission');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * Route for "Run" button functionality
 * Executes user code with custom input for testing
 * This is used when users want to test their code with sample input
 */
router.post('/run', auth, async (req, res) => {
  try {
    const { code, language, stdin } = req.body;
    
    // Input validation
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Code and language are required'
      });
    }

    // Validate language support
    const supportedLanguages = ['c', 'cpp', 'python', 'javascript'];
    if (!supportedLanguages.includes(language.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language: ${language}. Supported languages: ${supportedLanguages.join(', ')}`
      });
    }

    // Initialize code runner and execute
    const runner = new CodeRunner();
    const result = await runner.runCode(code, language.toLowerCase(), stdin || '');

    // Return execution results
    res.json({
      success: true,
      data: {
        status: result.status,
        stdout: result.stdout,
        stderr: result.stderr,
        executionTime: result.executionTime,
        compilationTime: result.compilationTime,
        message: getStatusMessage(result.status)
      }
    });

  } catch (error) {
    console.error('Error in /run endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Route for "Submit" button functionality
 * Runs user code against all test cases for the problem
 * This determines the final verdict (Accepted, Wrong Answer, etc.)
 */
router.post('/submit', auth, async (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    const userId = req.user.id;
    
    // Input validation
    if (!code || !language || !problemId) {
      return res.status(400).json({
        success: false,
        error: 'Code, language, and problemId are required'
      });
    }

    // Validate language support
    const supportedLanguages = ['c', 'cpp', 'python', 'javascript'];
    if (!supportedLanguages.includes(language.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language: ${language}. Supported languages: ${supportedLanguages.join(', ')}`
      });
    }

    // Check if problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    // Fetch test cases from database
    const testCases = await TestCase.find({ problemId }).select('input expectedOutput');
    
    if (!testCases || testCases.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No test cases found for this problem'
      });
    }

    // Convert database test cases to runner format
    const formattedTestCases = testCases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput
    }));

    // Execute code against all test cases
    const runner = new CodeRunner();
    const result = await runner.runTests(code, language.toLowerCase(), formattedTestCases);

    // Create submission record
    const submission = new Submission({
      userId,
      problemId,
      code,
      language: language.toLowerCase(),
      status: result.status,
      executionTime: result.totalExecutionTime,
      compilationTime: result.compilationTime,
      passedTests: result.passedTests,
      totalTests: result.totalTests,
      submittedAt: new Date()
    });

    await submission.save();

    // Update user's problem solving progress if accepted
    if (result.status === EXECUTION_STATUS.ACCEPTED) {
      // You can implement user progress tracking here
      // For example, add to user's solved problems list
    }

    // Return submission results
    res.json({
      success: true,
      data: {
        submissionId: submission._id,
        status: result.status,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        totalExecutionTime: result.totalExecutionTime,
        compilationTime: result.compilationTime,
        message: getStatusMessage(result.status),
        // Only include detailed results for debugging (optional)
        details: process.env.NODE_ENV === 'development' ? result.results : undefined
      }
    });

  } catch (error) {
    console.error('Error in /submit endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Route to get submission details
 * Allows users to view their past submissions
 */
router.get('/submission/:submissionId', auth, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user.id;

    const submission = await Submission.findOne({
      _id: submissionId,
      userId
    }).populate('problemId', 'title difficulty');

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: submission._id,
        problem: submission.problemId,
        code: submission.code,
        language: submission.language,
        status: submission.status,
        executionTime: submission.executionTime,
        compilationTime: submission.compilationTime,
        passedTests: submission.passedTests,
        totalTests: submission.totalTests,
        submittedAt: submission.submittedAt,
        message: getStatusMessage(submission.status)
      }
    });

  } catch (error) {
    console.error('Error in /submission/:submissionId endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Route to get user's submissions for a specific problem
 */
router.get('/submissions/:problemId', auth, async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const submissions = await Submission.find({
      userId,
      problemId
    })
    .sort({ submittedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('status executionTime compilationTime passedTests totalTests submittedAt');

    const total = await Submission.countDocuments({ userId, problemId });

    res.json({
      success: true,
      data: {
        submissions: submissions.map(sub => ({
          id: sub._id,
          status: sub.status,
          executionTime: sub.executionTime,
          compilationTime: sub.compilationTime,
          passedTests: sub.passedTests,
          totalTests: sub.totalTests,
          submittedAt: sub.submittedAt,
          message: getStatusMessage(sub.status)
        })),
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: submissions.length,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Error in /submissions/:problemId endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Helper function to get user-friendly status messages
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

  return messages[status] || 'Unknown status';
}

module.exports = router;
