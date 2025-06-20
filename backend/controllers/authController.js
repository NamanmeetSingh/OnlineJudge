const { generateToken } = require('../config/jwt');
const User = require('../models/User');

const authController = {
  // Google OAuth Success
  googleCallback: async (req, res) => {
    try {
      const user = req.user;
      const token = generateToken(user._id);
      
      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/error`);
    }
  },

  // Get current user
  getMe: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-__v');
      res.json({
        success: true,
        user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Logout
  logout: async (req, res) => {
    try {
      // In a more sophisticated setup, you might want to blacklist the token
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Verify token endpoint
  verifyToken: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-__v');
      res.json({
        success: true,
        valid: true,
        user
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        valid: false,
        message: 'Invalid token'
      });
    }
  }
};

module.exports = authController;
