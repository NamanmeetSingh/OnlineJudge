const { User, Problem, TestCase, UserProgress } = require('../models');
const mongoose = require('mongoose');

class AdminController {
  // Get admin dashboard stats
  static async getDashboardStats(req, res) {
    try {
      const stats = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'admin' }),
        Problem.countDocuments(),
        Problem.countDocuments({ isActive: true }),
        // Get recent registrations (last 7 days)
        User.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
      ]);

      const [totalUsers, totalAdmins, totalProblems, activeProblems, recentUsers] = stats;

      // Get most recent users
      const latestUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt');

      // Get problem statistics by difficulty
      const problemsByDifficulty = await Problem.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$difficulty',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          overview: {
            totalUsers,
            totalAdmins,
            totalProblems,
            activeProblems,
            recentUsers
          },
          latestUsers,
          problemsByDifficulty
        }
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics'
      });
    }
  }

  // Find user by ID and get their details
  static async findUserById(req, res) {
    try {
      const { userId } = req.params;

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }

      const user = await User.findById(userId)
        .populate('progress')
        .select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get additional user statistics
      const userStats = await Promise.all([
        user.submissions.length,
        user.solvedProblems.length
      ]);

      const [totalSubmissions, totalSolved] = userStats;

      res.json({
        success: true,
        data: {
          user,
          stats: {
            totalSubmissions,
            totalSolved
          }
        }
      });
    } catch (error) {
      console.error('Find user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user details'
      });
    }
  }

  // Search users by email or name
  static async searchUsers(req, res) {
    try {
      const { query, page = 1, limit = 10 } = req.query;

      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters long'
        });
      }

      const searchRegex = new RegExp(query.trim(), 'i');
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const users = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalCount = await User.countDocuments({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      });

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalCount,
            hasNext: skip + parseInt(limit) < totalCount,
            hasPrev: parseInt(page) > 1
          }
        }
      });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search users'
      });
    }
  }

  // Upgrade user to admin
  static async upgradeToAdmin(req, res) {
    try {
      const { userId } = req.params;

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.role === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'User is already an admin'
        });
      }

      user.role = 'admin';
      await user.save();

      res.json({
        success: true,
        message: `User ${user.name} has been upgraded to admin`,
        data: {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Upgrade to admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upgrade user to admin'
      });
    }
  }

  // Downgrade admin to user
  static async downgradeFromAdmin(req, res) {
    try {
      const { userId } = req.params;

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'User is not an admin'
        });
      }

      // Prevent admin from downgrading themselves
      if (user._id.toString() === req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You cannot downgrade yourself'
        });
      }

      user.role = 'user';
      await user.save();

      res.json({
        success: true,
        message: `User ${user.name} has been downgraded to regular user`,
        data: {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Downgrade from admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to downgrade user from admin'
      });
    }
  }

  // Create a new problem
  static async createProblem(req, res) {
    try {
      const {
        title,
        description,
        difficulty,
        tags,
        constraints,
        inputFormat,
        outputFormat,
        sampleTestCases,
        timeLimit,
        memoryLimit,
        points,
        hints,
        editorialContent
      } = req.body;

      // Validate required fields
      if (!title || !description || !difficulty || !inputFormat || !outputFormat) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: title, description, difficulty, inputFormat, outputFormat'
        });
      }

      // Create slug from title
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

      // Check if slug already exists
      const existingProblem = await Problem.findOne({ slug });
      if (existingProblem) {
        return res.status(400).json({
          success: false,
          message: 'A problem with similar title already exists'
        });
      }

      const problem = new Problem({
        title,
        slug,
        description,
        difficulty,
        tags: tags || [],
        constraints,
        inputFormat,
        outputFormat,
        sampleTestCases: sampleTestCases || [],
        timeLimit: timeLimit || 1000,
        memoryLimit: memoryLimit || 256,
        points: points || 100,
        hints: hints || [],
        editorialContent,
        createdBy: req.user.id
      });

      await problem.save();

      res.status(201).json({
        success: true,
        message: 'Problem created successfully',
        data: {
          problem
        }
      });
    } catch (error) {
      console.error('Create problem error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create problem'
      });
    }
  }

  // Add test cases to a problem
  static async addTestCases(req, res) {
    try {
      const { problemId } = req.params;
      const { testCases } = req.body;

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(problemId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid problem ID format'
        });
      }

      const problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({
          success: false,
          message: 'Problem not found'
        });
      }

      if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Test cases array is required and must not be empty'
        });
      }

      // Validate test cases
      const invalidTestCases = testCases.filter(tc => !tc.input || !tc.expectedOutput);
      if (invalidTestCases.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'All test cases must have input and expectedOutput'
        });
      }

      // Create test cases
      const createdTestCases = await Promise.all(
        testCases.map(tc => {
          const testCase = new TestCase({
            problemId,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden !== undefined ? tc.isHidden : true,
            weight: tc.weight || 1,
            group: tc.group || 'default',
            timeLimit: tc.timeLimit,
            memoryLimit: tc.memoryLimit,
            description: tc.description
          });
          return testCase.save();
        })
      );

      // Add test case references to problem
      problem.testCases.push(...createdTestCases.map(tc => tc._id));
      await problem.save();

      res.status(201).json({
        success: true,
        message: `${createdTestCases.length} test cases added successfully`,
        data: {
          testCases: createdTestCases
        }
      });
    } catch (error) {
      console.error('Add test cases error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add test cases'
      });
    }
  }

  // Get all problems for admin with pagination
  static async getProblems(req, res) {
    try {
      const { page = 1, limit = 10, difficulty, isActive } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build query
      const query = {};
      if (difficulty) {
        query.difficulty = difficulty;
      }
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }

      const problems = await Problem.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalCount = await Problem.countDocuments(query);

      res.json({
        success: true,
        data: {
          problems,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalCount,
            hasNext: skip + parseInt(limit) < totalCount,
            hasPrev: parseInt(page) > 1
          }
        }
      });
    } catch (error) {
      console.error('Get problems error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch problems'
      });
    }
  }

  // Toggle problem active status
  static async toggleProblemStatus(req, res) {
    try {
      const { problemId } = req.params;

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(problemId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid problem ID format'
        });
      }

      const problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({
          success: false,
          message: 'Problem not found'
        });
      }

      problem.isActive = !problem.isActive;
      await problem.save();

      res.json({
        success: true,
        message: `Problem ${problem.isActive ? 'activated' : 'deactivated'} successfully`,
        data: {
          problemId: problem._id,
          title: problem.title,
          isActive: problem.isActive
        }
      });
    } catch (error) {
      console.error('Toggle problem status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle problem status'
      });
    }
  }

  // Create a simple test problem (for development only)
  static async createTestProblem(req, res) {
    try {
      // Check if test problem already exists
      const existingProblem = await Problem.findOne({ slug: 'hello-world' });
      if (existingProblem) {
        return res.json({
          success: true,
          message: 'Test problem already exists',
          data: { problem: existingProblem }
        });
      }

      // Create test cases
      const testCase1 = new TestCase({
        input: '',
        expectedOutput: 'Hello, World!',
        isHidden: false
      });
      await testCase1.save();

      const testCase2 = new TestCase({
        input: '',
        expectedOutput: 'Hello, World!',
        isHidden: true
      });
      await testCase2.save();

      // Create the problem
      const problem = new Problem({
        title: 'Hello World',
        slug: 'hello-world',
        difficulty: 'Easy',
        description: `Write a program that outputs "Hello, World!" to the console.

**Example:**
Output: Hello, World!

This is a simple problem to test the system.`,
        constraints: ['No specific constraints'],
        tags: ['Basic', 'Output'],
        points: 10,
        timeLimit: 1000,
        memoryLimit: 256,
        isActive: true,
        testCases: [testCase1._id, testCase2._id],
        createdBy: req.user._id
      });

      await problem.save();

      res.json({
        success: true,
        message: 'Test problem created successfully',
        data: { problem }
      });
    } catch (error) {
      console.error('Create test problem error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create test problem'
      });
    }
  }

  // Create admin user for testing (development only)
  static async createTestAdmin(req, res) {
    try {
      // Check if admin already exists
      const existingAdmin = await User.findOne({ email: 'admin@test.com' });
      if (existingAdmin) {
        return res.json({
          success: true,
          message: 'Test admin already exists',
          data: { user: existingAdmin }
        });
      }

      // Create admin user
      const admin = await User.create({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        provider: 'local',
        isEmailVerified: true
      });

      res.json({
        success: true,
        message: 'Test admin created successfully',
        data: { 
          user: admin,
          credentials: {
            email: 'admin@test.com',
            password: 'admin123'
          }
        }
      });
    } catch (error) {
      console.error('Create test admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create test admin'
      });
    }
  }
}

module.exports = AdminController;
