const { generateToken } = require('../config/jwt');
const User = require('../models/User');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide name, email, and password'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create new user
      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase(),
        password,
        provider: 'local'
      });

      // Generate JWT token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration'
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password'
        });
      }

      // Find user and include password for comparison
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        isActive: true 
      }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if user is local provider
      if (user.provider !== 'local') {
        return res.status(400).json({
          success: false,
          message: `This account was created with ${user.provider}. Please use ${user.provider} to sign in.`
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login'
      });
    }
  },

  // Google OAuth Success
  googleCallback: async (req, res) => {
    try {
      const user = req.user;
      const token = generateToken(user._id);
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      
      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/error`);
    }
  },

  // Get current user
  getMe: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
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
      const user = await User.findById(req.user._id);
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
