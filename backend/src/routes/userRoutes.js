const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  getUserProfile,
  getUserSubmissions,
  updateUser,
  deleteUser,
  getLeaderboard,
  getUserStats,
  searchUsers
} = require('../controllers/userController');
const {
  optionalAuth,
  authenticateToken,
  requireAdmin,
  validationRules,
  combineValidations
} = require('../middleware');

// Public routes
router.get('/', 
  combineValidations(validationRules.query.pagination, validationRules.query.sorting),
  getUsers
);

router.get('/leaderboard',
  combineValidations(validationRules.query.pagination),
  getLeaderboard
);

router.get('/stats', getUserStats);

router.get('/search', searchUsers);

router.get('/:id',
  combineValidations(validationRules.params.mongoId),
  getUserById
);

router.get('/:id/profile',
  combineValidations(validationRules.params.mongoId),
  optionalAuth,
  getUserProfile
);

router.get('/:id/submissions',
  combineValidations(validationRules.params.mongoId, validationRules.query.pagination),
  optionalAuth,
  getUserSubmissions
);

// Admin only routes
router.put('/:id',
  combineValidations(validationRules.params.mongoId),
  authenticateToken,
  requireAdmin,
  updateUser
);

router.delete('/:id',
  combineValidations(validationRules.params.mongoId),
  authenticateToken,
  requireAdmin,
  deleteUser
);

module.exports = router;
