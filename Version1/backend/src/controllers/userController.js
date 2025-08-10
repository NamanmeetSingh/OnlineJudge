const { User, Submission } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all users (leaderboard)
// @route   GET /api/users
// @access  Public
const getUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sortBy = 'rating',
    search,
    country
  } = req.query;
  
  let query = { isActive: true };
  
  // Apply search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Apply country filter
  if (country) {
    query.country = country;
  }
  
  const users = await User.getLeaderboard(parseInt(limit), sortBy);
  const total = await User.countDocuments(query);
  
  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  if (!user.isActive) {
    return res.status(404).json({
      success: false,
      message: 'User account is deactivated'
    });
  }
  
  res.json({
    success: true,
    data: { user }
  });
});

// @desc    Get user profile with detailed stats
// @route   GET /api/users/:id/profile
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  if (!user.isActive) {
    return res.status(404).json({
      success: false,
      message: 'User account is deactivated'
    });
  }
  
  // Get user's submission statistics
  const submissionStats = await Submission.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Get user's language statistics
  const languageStats = await Submission.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: '$language',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Get user's recent submissions
  const recentSubmissions = await Submission.find({ user: user._id })
    .populate('problem', 'title slug difficulty')
    .sort({ createdAt: -1 })
    .limit(10);
  
  // Get user's rank
  const rank = await User.getUserRank(user._id);
  
  // Format submission stats
  const formattedSubmissionStats = {
    total: 0,
    accepted: 0,
    wrongAnswer: 0,
    timeLimit: 0,
    memoryLimit: 0,
    runtimeError: 0,
    compilationError: 0
  };
  
  submissionStats.forEach(stat => {
    formattedSubmissionStats.total += stat.count;
    switch (stat._id) {
      case 'Accepted':
        formattedSubmissionStats.accepted = stat.count;
        break;
      case 'Wrong Answer':
        formattedSubmissionStats.wrongAnswer = stat.count;
        break;
      case 'Time Limit Exceeded':
        formattedSubmissionStats.timeLimit = stat.count;
        break;
      case 'Memory Limit Exceeded':
        formattedSubmissionStats.memoryLimit = stat.count;
        break;
      case 'Runtime Error':
        formattedSubmissionStats.runtimeError = stat.count;
        break;
      case 'Compilation Error':
        formattedSubmissionStats.compilationError = stat.count;
        break;
    }
  });
  
  res.json({
    success: true,
    data: {
      user: {
        ...user.toObject(),
        rank
      },
      stats: {
        submissions: formattedSubmissionStats,
        languages: languageStats,
        recentSubmissions
      }
    }
  });
});

// @desc    Get user's submissions
// @route   GET /api/users/:id/submissions
// @access  Public
const getUserSubmissions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    language,
    problemId
  } = req.query;
  
  const filters = {
    page: parseInt(page),
    limit: parseInt(limit)
  };
  
  if (status) filters.status = status;
  if (language) filters.language = language;
  if (problemId) filters.problemId = problemId;
  
  const submissions = await Submission.getUserSubmissions(req.params.id, filters);
  const total = await Submission.countDocuments({ user: req.params.id });
  
  res.json({
    success: true,
    data: {
      submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Update user (admin only)
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name', 'email', 'rating', 'role', 'isActive', 
    'isEmailVerified', 'bio', 'country'
  ];
  
  const updates = {};
  
  // Only include allowed fields
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user }
  });
});

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Soft delete by deactivating account
  user.isActive = false;
  await user.save();
  
  res.json({
    success: true,
    message: 'User deactivated successfully'
  });
});

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
const getLeaderboard = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    sortBy = 'rating',
    country
  } = req.query;
  
  let users = await User.getLeaderboard(parseInt(limit), sortBy);
  
  // Filter by country if specified
  if (country) {
    users = users.filter(user => user.country === country);
  }
  
  // Add ranks
  users.forEach((user, index) => {
    user.rank = index + 1;
  });
  
  const total = users.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedUsers = users.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      users: paginatedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Public
const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        avgProblemsSolved: { $avg: '$problemsSolved' },
        totalProblemsSolved: { $sum: '$problemsSolved' },
        totalSubmissions: { $sum: '$submissions' },
        countries: { $addToSet: '$country' }
      }
    }
  ]);
  
  // Get rating distribution
  const ratingDistribution = await User.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $bucket: {
        groupBy: '$rating',
        boundaries: [0, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 5000],
        default: 'Other',
        output: {
          count: { $sum: 1 }
        }
      }
    }
  ]);
  
  // Get recent joiners
  const recentJoiners = await User.find({ isActive: true })
    .select('name avatar createdAt')
    .sort({ createdAt: -1 })
    .limit(10);
  
  const result = stats[0] || {
    totalUsers: 0,
    avgRating: 0,
    avgProblemsSolved: 0,
    totalProblemsSolved: 0,
    totalSubmissions: 0,
    countries: []
  };
  
  delete result._id;
  
  res.json({
    success: true,
    data: {
      ...result,
      ratingDistribution,
      recentJoiners,
      uniqueCountries: result.countries.filter(c => c).length
    }
  });
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
const searchUsers = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;
  
  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters'
    });
  }
  
  const users = await User.find({
    isActive: true,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ]
  })
    .select('name email avatar rating problemsSolved')
    .limit(parseInt(limit));
  
  res.json({
    success: true,
    data: { users }
  });
});

module.exports = {
  getUsers,
  getUserById,
  getUserProfile,
  getUserSubmissions,
  updateUser,
  deleteUser,
  getLeaderboard,
  getUserStats,
  searchUsers
};
