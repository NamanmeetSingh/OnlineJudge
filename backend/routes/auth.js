const express = require('express');
const passport = require('../config/passport');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   POST /auth/register
// @desc    Register new user
// @access  Public
router.post('/register', authController.register);

// @route   POST /auth/login
// @desc    Login user
// @access  Public
router.post('/login', authController.login);

// @route   GET /auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET /auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  authController.googleCallback
);

// @route   GET /auth/error
// @desc    Authentication error page
// @access  Public
router.get('/error', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Authentication failed'
  });
});

// @route   GET /auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, authController.getMe);

// @route   POST /auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authMiddleware, authController.logout);

// @route   GET /auth/verify
// @desc    Verify token
// @access  Private
router.get('/verify', authMiddleware, authController.verifyToken);

// @route   GET /auth/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', authMiddleware, authController.getDashboard);

module.exports = router;
