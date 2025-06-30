const express = require('express');
const axios = require('axios');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Proxy requests to compiler service
const COMPILER_SERVICE_URL = process.env.COMPILER_SERVICE_URL || 'http://localhost:3001';

// @route   POST /api/compiler/run
// @desc    Run code with custom input
// @access  Private
router.post('/run', authMiddleware, async (req, res) => {
  try {
    const { code, language, stdin, timeoutMs } = req.body;

    const response = await axios.post(
      `${COMPILER_SERVICE_URL}/api/execute/run`,
      {
        code,
        language,
        stdin,
        timeoutMs
      },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Compiler run error:', error);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        success: false,
        message: 'Compiler service unavailable'
      });
    }
  }
});

// @route   POST /api/compiler/submit
// @desc    Submit code against test cases
// @access  Private
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { code, language, testCases, problemId, stopOnFirstFailure } = req.body;

    const response = await axios.post(
      `${COMPILER_SERVICE_URL}/api/execute/submit`,
      {
        code,
        language,
        testCases,
        problemId,
        stopOnFirstFailure
      },
      {
        timeout: 60000, // Longer timeout for submissions
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Compiler submit error:', error);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        success: false,
        message: 'Compiler service unavailable'
      });
    }
  }
});

// @route   GET /api/compiler/languages
// @desc    Get supported languages
// @access  Private
router.get('/languages', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(
      `${COMPILER_SERVICE_URL}/api/execute/languages`,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Compiler languages error:', error);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        success: false,
        message: 'Compiler service unavailable'
      });
    }
  }
});

// @route   GET /api/compiler/limits
// @desc    Get execution limits
// @access  Private
router.get('/limits', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(
      `${COMPILER_SERVICE_URL}/api/execute/limits`,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Compiler limits error:', error);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        success: false,
        message: 'Compiler service unavailable'
      });
    }
  }
});

module.exports = router;
