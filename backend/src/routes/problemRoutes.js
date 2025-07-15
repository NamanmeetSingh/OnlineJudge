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

// Public routes
router.get('/', getProblems);
router.get('/stats', getProblemStats);
router.get('/trending', getTrendingProblems);
router.get('/:id', getProblemById);

// Protected routes
router.use(authenticateToken); // All routes after this require authentication

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
