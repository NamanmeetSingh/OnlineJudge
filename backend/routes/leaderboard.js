const express = require('express');
const router = express.Router();
const LeaderboardController = require('../controllers/leaderboardController');

// Public routes
router.get('/', LeaderboardController.getLeaderboard);
router.get('/stats', LeaderboardController.getLeaderboardStats);
router.get('/rank/:userId', LeaderboardController.getUserRank);

module.exports = router;
