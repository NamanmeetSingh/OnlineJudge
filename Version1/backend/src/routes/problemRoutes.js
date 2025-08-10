const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getProblems,
  getProblemById,
  getProblemStats,
  getTrendingProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  toggleProblemLike
} = require('../controllers/problemController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const GeminiService = require('../services/GeminiService');

const geminiService = new GeminiService();

// Public routes
router.get('/', getProblems);
router.get('/stats', getProblemStats);
router.get('/trending', getTrendingProblems);
router.get('/:id', getProblemById);

// Protected routes
router.use(authenticateToken); // All routes after this require authentication

// Run code endpoint (for testing code with custom input)
router.post('/:id/run', async (req, res) => {
  try {
    const { code, language, input } = req.body;
    const { id } = req.params;
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

    res.json({
      success: true,
      data: {
        status: result.status,
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed
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
});

router.post('/:id/like', toggleProblemLike);

// Admin only routes
router.use(requireAdmin);

const problemValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty level'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('constraints').trim().isLength({ min: 1 }).withMessage('Constraints are required'),
  body('examples').isArray({ min: 1 }).withMessage('At least one example is required'),
  body('examples.*.input').trim().isLength({ min: 1 }).withMessage('Example input is required'),
  body('examples.*.output').trim().isLength({ min: 1 }).withMessage('Example output is required'),
  body('tags').isArray().withMessage('Tags must be an array'),
  handleValidationErrors
];

router.post('/', problemValidation, createProblem);
router.put('/:id', problemValidation, updateProblem);
router.delete('/:id', deleteProblem);

module.exports = router;
