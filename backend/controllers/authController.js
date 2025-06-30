const { generateToken } = require('../config/jwt');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');

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
  },

  // Get user dashboard data
  getDashboard: async (req, res) => {
    try {
      const userId = req.user._id;

      // Get user data
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get or create user progress
      let progress = await UserProgress.findOne({ userId });
      if (!progress) {
        progress = new UserProgress({ userId });
        await progress.save();
      }

      // Get total problems count
      const totalProblems = await Problem.countDocuments({ isActive: true });

      // Get recent submissions
      const recentSubmissions = await Submission.find({ user: userId })
        .populate('problem', 'title difficulty')
        .sort({ createdAt: -1 })
        .limit(10);

      // Calculate current streak (days with at least one accepted submission)
      const acceptedSubmissions = await Submission.find({ 
        user: userId, 
        status: 'Accepted' 
      }).sort({ createdAt: -1 });

      let currentStreak = 0;
      if (acceptedSubmissions.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const submissionDates = new Set();
        acceptedSubmissions.forEach(sub => {
          const date = new Date(sub.createdAt);
          date.setHours(0, 0, 0, 0);
          submissionDates.add(date.getTime());
        });

        const sortedDates = Array.from(submissionDates).sort((a, b) => b - a);
        
        let checkDate = today.getTime();
        for (const dateTime of sortedDates) {
          if (dateTime === checkDate) {
            currentStreak++;
            checkDate -= 24 * 60 * 60 * 1000; // Previous day
          } else if (dateTime < checkDate) {
            break;
          }
        }
      }

      // Get unique solved problems count
      const uniqueSolvedProblems = await Submission.distinct('problem', {
        user: userId,
        status: 'Accepted'
      });

      // Prepare dashboard data
      const dashboardData = {
        user: {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role
        },
        stats: {
          problemsSolved: uniqueSolvedProblems.length,
          totalProblems,
          streak: currentStreak,
          points: progress.totalXP,
          rank: progress.globalRank || 0,
          level: progress.level,
          contests: progress.contestsStats ? progress.contestsStats.participated : 0
        },
        recentSubmissions: recentSubmissions.map(sub => ({
          id: sub._id,
          problem: sub.problem ? sub.problem.title : 'Unknown Problem',
          status: sub.status.toLowerCase(),
          time: sub.createdAt,
          difficulty: sub.problem ? sub.problem.difficulty : 'Unknown',
          language: sub.language,
          runtime: sub.runtime
        })),
        achievements: progress.achievements || []
      };

      res.json({
        success: true,
        data: dashboardData
      });

    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
};

module.exports = authController;
