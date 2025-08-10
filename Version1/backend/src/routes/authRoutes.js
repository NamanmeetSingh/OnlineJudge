const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  sendEmailVerification,
  verifyEmail,
  logout
} = require('../controllers/authController');
const {
  authenticateToken,
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  validationRules,
  combineValidations
} = require('../middleware');

// Public routes with rate limiting
router.post('/register', 
  authLimiter,
  combineValidations(validationRules.user.register),
  register
);

router.post('/login',
  authLimiter,
  combineValidations(validationRules.user.login),
  login
);

router.post('/refresh',
  authLimiter,
  refreshToken
);

router.post('/forgot-password',
  passwordResetLimiter,
  forgotPassword
);

router.post('/reset-password/:token',
  passwordResetLimiter,
  combineValidations(validationRules.user.changePassword.slice(1)), // Only new password validation
  resetPassword
);

router.post('/verify-email/:token',
  emailVerificationLimiter,
  verifyEmail
);

// Protected routes
router.use(authenticateToken); // Apply authentication to all routes below

router.get('/me', getMe);

router.put('/profile',
  combineValidations(validationRules.user.updateProfile),
  updateProfile
);

router.put('/change-password',
  combineValidations(validationRules.user.changePassword),
  changePassword
);

router.post('/send-verification',
  emailVerificationLimiter,
  sendEmailVerification
);

router.post('/logout', logout);

module.exports = router;
