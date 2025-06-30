const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Dashboard routes
router.get('/dashboard/stats', auth, adminAuth, AdminController.getDashboardStats);

// User management routes  
router.get('/users/search', auth, adminAuth, AdminController.searchUsers);
router.get('/users/:userId', auth, adminAuth, AdminController.findUserById);
router.put('/users/:userId/upgrade', auth, adminAuth, AdminController.upgradeToAdmin);
router.put('/users/:userId/downgrade', auth, adminAuth, AdminController.downgradeFromAdmin);

// Problem management routes
router.get('/problems', auth, adminAuth, AdminController.getProblems);
router.post('/problems', auth, adminAuth, AdminController.createProblem);
router.put('/problems/:problemId/toggle-status', auth, adminAuth, AdminController.toggleProblemStatus);
router.post('/create-test-problem', auth, adminAuth, AdminController.createTestProblem);
router.post('/create-test-admin', AdminController.createTestAdmin); // No auth needed for initial setup

// Test case management routes
router.post('/problems/:problemId/testcases', auth, adminAuth, AdminController.addTestCases);

module.exports = router;
