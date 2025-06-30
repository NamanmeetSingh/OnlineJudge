const express = require('express');
const router = express.Router();
const SubmissionController = require('../controllers/submissionController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Protected routes (require authentication)
router.post('/', auth, SubmissionController.createSubmission);
router.get('/', auth, SubmissionController.getUserSubmissions);
router.get('/:id', auth, SubmissionController.getSubmission);
router.post('/run', auth, SubmissionController.runCode);

// Admin routes
router.get('/admin/all', adminAuth, SubmissionController.getAllSubmissions);

module.exports = router;
