const express = require('express');
const SimpleCompilerService = require('../services/SimpleCompilerService');

const router = express.Router();
const compilerService = new SimpleCompilerService();

// Execute code (for testing/running)
router.post('/execute', async (req, res) => {
  try {
    const { code, language, input = '', timeLimit = 10 } = req.body;

    // Basic validation
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required'
      });
    }

    const result = await compilerService.executeCode({
      code,
      language,
      input,
      timeLimit
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      message: 'Code execution failed',
      error: error.message
    });
  }
});

// Submit solution (for evaluation against test cases)
router.post('/submit', async (req, res) => {
  try {
    const { code, language, problemId, testCases, timeLimit = 10 } = req.body;

    // Basic validation
    if (!code || !language || !problemId || !testCases) {
      return res.status(400).json({
        success: false,
        message: 'Code, language, problemId, and testCases are required'
      });
    }

    const result = await compilerService.submitSolution({
      code,
      language,
      problemId,
      testCases,
      timeLimit
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Solution submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Solution submission failed',
      error: error.message
    });
  }
});

// Submit function-based solution (LeetCode style)
router.post('/submit-function', async (req, res) => {
  try {
    const { code, language, problemId, testCases, timeLimit = 10 } = req.body;

    // Basic validation
    if (!code || !language || !problemId || !testCases) {
      return res.status(400).json({
        success: false,
        message: 'Code, language, problemId, and testCases are required'
      });
    }

    const result = await compilerService.submitFunctionSolution({
      code,
      language,
      problemId,
      testCases,
      timeLimit
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Function-based solution submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Function-based solution submission failed',
      error: error.message
    });
  }
});

// Execute function with sample test (for testing)
router.post('/execute-function', async (req, res) => {
  try {
    const { code, language, testCases, timeLimit = 10 } = req.body;

    // Basic validation
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required'
      });
    }

    // Create sample test cases if none provided
    let sampleTestCases = testCases;
    if (!sampleTestCases || sampleTestCases.length === 0) {
      sampleTestCases = [{
        input: '1\n2\n3',
        expectedOutput: '6'
      }];
    }
    
    const result = await compilerService.submitFunctionSolution({
      code,
      language,
      problemId: 'sample',
      testCases: sampleTestCases,
      timeLimit
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Function execution error:', error);
    res.status(500).json({
      success: false,
      message: 'Function execution failed',
      error: error.message
    });
  }
});

// Get supported languages
router.get('/languages', (req, res) => {
  const languages = compilerService.getSupportedLanguages();
  res.json({
    success: true,
    data: languages
  });
});

// Get execution statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await compilerService.getExecutionStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Stats retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: error.message
    });
  }
});

module.exports = router;
