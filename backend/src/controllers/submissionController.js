const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const GeminiService = require('../services/GeminiService');

const geminiService = new GeminiService();

// Run code with custom input (for testing)
const runCode = async (req, res) => {
  try {
    const { code, language, input, problemId } = req.body;
    const userId = req.user.id;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required'
      });
    }

    // Validate language
    const supportedLanguages = ['python', 'javascript', 'java', 'cpp', 'c'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language'
      });
    }

    // Execute code using Gemini API
    const result = await geminiService.runCode(code, language, input);

    // Create a submission record for tracking
    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      status: result.status === 'success' ? 'run_success' : 'run_error',
      executionTime: result.executionTime,
      memoryUsed: result.memoryUsed,
      input: input || '',
      output: result.output || '',
      error: result.error || '',
      isTestRun: true
    });

    await submission.save();

    res.json({
      success: true,
      data: {
        status: result.status,
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        submissionId: submission._id
      }
    });

  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run code',
      error: error.message
    });
  }
};

// Submit solution for evaluation
const submitSolution = async (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    const userId = req.user.id;

    if (!code || !language || !problemId) {
      return res.status(400).json({
        success: false,
        message: 'Code, language, and problem ID are required'
      });
    }

    // Get problem details including test cases
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Validate language
    const supportedLanguages = ['python', 'javascript', 'java', 'cpp', 'c'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language'
      });
    }

    // Execute solution against all test cases using Gemini API
    const result = await geminiService.submitSolution(code, language, problemId, problem.testCases, problem.functionSignature);

    // Determine final status
    let finalStatus = 'wrong_answer';
    if (result.status === 'accepted') {
      finalStatus = 'accepted';
    } else if (result.status === 'runtime_error') {
      finalStatus = 'runtime_error';
    } else if (result.status === 'compilation_error') {
      finalStatus = 'compilation_error';
    }

    // Create submission record
    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      status: finalStatus,
      executionTime: result.executionTime,
      memoryUsed: result.memoryUsed,
      passedTestCases: result.passedTestCases,
      totalTestCases: result.totalTestCases,
      testCaseResults: result.testCaseResults,
      isTestRun: false
    });

    await submission.save();

    // Update problem statistics
    problem.updateSubmissionStats(finalStatus === 'accepted');
    await problem.save();

    // Update user statistics
    const user = await User.findById(userId);
    if (user) {
      user.totalSubmissions += 1;
      if (finalStatus === 'accepted') {
        user.acceptedSubmissions += 1;
      }
      await user.save();
    }

    res.json({
      success: true,
      data: {
        submissionId: submission._id,
        status: finalStatus,
        passedTestCases: result.passedTestCases,
        totalTestCases: result.totalTestCases,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        testCaseResults: result.testCaseResults
      }
    });

  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit solution',
      error: error.message
    });
  }
};

// Execute function-based code (LeetCode style)
const executeFunctionCode = async (req, res) => {
  try {
    const { code, language, problemId, timeLimit } = req.body;
    const userId = req.user.id;

    if (!code || !language || !problemId) {
      return res.status(400).json({
        success: false,
        message: 'Code, language, and problem ID are required'
      });
    }

    // Get problem details including test cases and function signature
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Check if function signature exists for the language
    if (!problem.functionSignature || !problem.functionSignature[language]) {
      return res.status(400).json({
        success: false,
        message: `Function signature not available for ${language}`
      });
    }

    // Use sample test cases for function execution (not hidden ones)
    const sampleTestCases = problem.examples.map((example, index) => ({
      input: example.input,
      expectedOutput: example.output
    }));

    // Execute function code using Gemini API
    const result = await geminiService.executeFunctionCode(
      code, 
      language, 
      sampleTestCases, 
      problem.functionSignature
    );

    // Create a submission record for tracking
    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      status: result.overallPassed ? 'sample_passed' : 'sample_failed',
      executionTime: Math.max(...result.results.map(r => r.executionTime || 0)),
      memoryUsed: Math.max(...result.results.map(r => r.memoryUsed || 0)),
      passedTestCases: result.passedCount,
      totalTestCases: result.totalCount,
      testCaseResults: result.results.map(r => ({
        testCaseNumber: r.testCaseNumber,
        input: r.input,
        expectedOutput: r.expectedOutput,
        actualOutput: r.actualOutput,
        passed: r.passed,
        status: r.status,
        error: r.error
      })),
      isTestRun: true
    });

    await submission.save();

    res.json({
      success: true,
      data: {
        status: result.overallPassed ? 'accepted' : 'wrong_answer',
        overallPassed: result.overallPassed,
        passedCount: result.passedCount,
        totalCount: result.totalCount,
        results: result.results,
        executionTime: Math.max(...result.results.map(r => r.executionTime || 0)),
        memoryUsed: Math.max(...result.results.map(r => r.memoryUsed || 0)),
        submissionId: submission._id
      }
    });

  } catch (error) {
    console.error('Execute function code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute function code',
      error: error.message
    });
  }
};

// Submit function-based solution
const submitFunctionSolution = async (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    const userId = req.user.id;

    if (!code || !language || !problemId) {
      return res.status(400).json({
        success: false,
        message: 'Code, language, and problem ID are required'
      });
    }

    // Get problem details including all test cases and function signature
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Check if function signature exists for the language
    if (!problem.functionSignature || !problem.functionSignature[language]) {
      return res.status(400).json({
        success: false,
        message: `Function signature not available for ${language}`
      });
    }

    // Execute solution against all test cases using Gemini API
    const result = await geminiService.executeFunctionCode(
      code, 
      language, 
      problem.testCases, 
      problem.functionSignature
    );

    // Determine final status
    let finalStatus = 'wrong_answer';
    if (result.overallPassed) {
      finalStatus = 'accepted';
    } else if (result.results.some(r => r.status === 'error')) {
      finalStatus = 'runtime_error';
    }

    // Create submission record
    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      status: finalStatus,
      executionTime: Math.max(...result.results.map(r => r.executionTime || 0)),
      memoryUsed: Math.max(...result.results.map(r => r.memoryUsed || 0)),
      passedTestCases: result.passedCount,
      totalTestCases: result.totalCount,
      testCaseResults: result.results.map(r => ({
        testCaseNumber: r.testCaseNumber,
        input: r.input,
        expectedOutput: r.expectedOutput,
        actualOutput: r.actualOutput,
        passed: r.passed,
        status: r.status,
        error: r.error
      })),
      isTestRun: false
    });

    await submission.save();

    // Update problem statistics
    problem.updateSubmissionStats(finalStatus === 'accepted');
    await problem.save();

    // Update user statistics
    const user = await User.findById(userId);
    if (user) {
      user.totalSubmissions += 1;
      if (finalStatus === 'accepted') {
        user.acceptedSubmissions += 1;
      }
      await user.save();
    }

    res.json({
      success: true,
      data: {
        submissionId: submission._id,
        status: finalStatus,
        passedTestCases: result.passedCount,
        totalTestCases: result.totalCount,
        executionTime: Math.max(...result.results.map(r => r.executionTime || 0)),
        memoryUsed: Math.max(...result.results.map(r => r.memoryUsed || 0)),
        testCaseResults: result.results.map(r => ({
          testCaseNumber: r.testCaseNumber,
          input: r.input,
          expectedOutput: r.expectedOutput,
          actualOutput: r.actualOutput,
          passed: r.passed,
          status: r.status,
          error: r.error
        }))
      }
    });

  } catch (error) {
    console.error('Submit function solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit function solution',
      error: error.message
    });
  }
};

// Get user submissions for a problem
const getUserSubmissions = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const [submissions, totalCount] = await Promise.all([
      Submission.find({ user: userId, problem: problemId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Submission.countDocuments({ user: userId, problem: problemId })
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        submissions: submissions.map(sub => ({
          ...sub,
          id: sub._id.toString()
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user submissions',
      error: error.message
    });
  }
};

// Get submission details
const getSubmissionDetails = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user.id;

    const submission = await Submission.findById(submissionId)
      .populate('problem', 'title slug')
      .lean();

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if user owns this submission
    if (submission.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        ...submission,
        id: submission._id.toString()
      }
    });

  } catch (error) {
    console.error('Get submission details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get submission details',
      error: error.message
    });
  }
};

module.exports = {
  runCode,
  submitSolution,
  executeFunctionCode,
  submitFunctionSolution,
  getUserSubmissions,
  getSubmissionDetails
};
