const express = require('express');
const router = express.Router();
const ProblemController = require('../controllers/problemController');
const auth = require('../middleware/auth');

// Public routes (no auth required)
router.get('/stats', ProblemController.getProblemStats);

// Protected routes (auth required)
router.get('/', auth, ProblemController.getProblems);
router.get('/random', auth, ProblemController.getRandomProblem);
router.get('/difficulty/:difficulty', auth, ProblemController.getProblemsByDifficulty);
router.get('/:slug', auth, ProblemController.getProblemBySlug);
router.get('/:slug/testcases', auth, ProblemController.getVisibleTestCases);

module.exports = router;
