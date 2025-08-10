const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  runCode,
  submitSolution,
  executeFunctionCode,
  submitFunctionSolution,
  getUserSubmissions,
  getSubmissionDetails
} = require('../controllers/submissionController');

// All routes require authentication
router.use(authenticateToken);

// Run code with custom input
router.post('/run', runCode);

// Submit solution for evaluation
router.post('/submit', submitSolution);

// Execute function-based code (LeetCode style)
router.post('/execute-function', executeFunctionCode);

// Submit function-based solution
router.post('/submit-function', submitFunctionSolution);

// Get user submissions for a specific problem
router.get('/problem/:problemId', getUserSubmissions);

// Get submission details
router.get('/:submissionId', getSubmissionDetails);

module.exports = router;
