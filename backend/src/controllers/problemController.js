const Problem = require('../models/Problem');
const { validationResult } = require('express-validator');

// Get all problems with filtering, sorting, and pagination
const getProblems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      difficulty,
      category,
      tags,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object - only add filters if they have actual values
    const filters = { isActive: true };

    if (difficulty && difficulty !== 'all' && difficulty !== 'undefined') {
      if (Array.isArray(difficulty)) {
        filters.difficulty = { $in: difficulty };
      } else {
        filters.difficulty = difficulty;
      }
    }

    if (category && category !== 'all' && category !== 'undefined') {
      if (Array.isArray(category)) {
        filters.category = { $in: category };
      } else {
        filters.category = category;
      }
    }

    if (tags && tags.length > 0 && tags !== 'undefined') {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filters.tags = { $in: tagArray };
    }

    if (search && search !== 'undefined' && search.trim() !== '') {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Applied filters:', JSON.stringify(filters, null, 2));

    // Sorting
    const sortOptions = {};
    const validSortFields = ['title', 'difficulty', 'createdAt', 'acceptanceRate', 'totalSubmissions'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;

    // If sorting by difficulty, add secondary sort
    if (sortField === 'difficulty') {
      sortOptions.createdAt = -1;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query
    const [problems, totalCount] = await Promise.all([
      Problem.find(filters)
        .populate('createdBy', 'name avatar')
        .select('-testCases -solution') // Exclude sensitive data
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Problem.countDocuments(filters)
    ]);

    console.log(`Found ${problems.length} problems out of ${totalCount} total`);

    // Transform _id to id for frontend compatibility
    const transformedProblems = problems.map(problem => ({
      ...problem,
      id: problem._id.toString()
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        problems: transformedProblems,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problems',
      error: error.message
    });
  }
};

// Get problem by ID or slug
const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by ID first, then by slug
    let problem = await Problem.findById(id)
      .populate('createdBy', 'name avatar')
      .lean();
    
    if (!problem) {
      problem = await Problem.findOne({ slug: id })
        .populate('createdBy', 'name avatar')
        .lean();
    }

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Transform _id to id for frontend compatibility
    if (problem._id) {
      problem.id = problem._id.toString();
    }

    // Don't include test cases for security
    delete problem.testCases;

    res.json({
      success: true,
      data: problem
    });

  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problem',
      error: error.message
    });
  }
};

// Get problem statistics
const getProblemStats = async (req, res) => {
  try {
    const stats = await Problem.getStats();
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching problem stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problem statistics',
      error: error.message
    });
  }
};

// Get trending problems
const getTrendingProblems = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const problems = await Problem.getTrendingProblems(parseInt(limit));
    
    res.json({
      success: true,
      data: problems
    });

  } catch (error) {
    console.error('Error fetching trending problems:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending problems',
      error: error.message
    });
  }
};

// Create a new problem (Admin only)
const createProblem = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const problemData = {
      ...req.body,
      createdBy: req.user.id
    };

    const problem = new Problem(problemData);
    await problem.save();

    await problem.populate('createdBy', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      data: problem
    });

  } catch (error) {
    console.error('Error creating problem:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Problem with this title or slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create problem',
      error: error.message
    });
  }
};

// Update problem (Admin only)
const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updateData = {
      ...req.body,
      lastUpdatedBy: req.user.id
    };

    const problem = await Problem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy lastUpdatedBy', 'name avatar');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.json({
      success: true,
      message: 'Problem updated successfully',
      data: problem
    });

  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update problem',
      error: error.message
    });
  }
};

// Delete problem (Admin only)
const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const problem = await Problem.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.json({
      success: true,
      message: 'Problem deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete problem',
      error: error.message
    });
  }
};

// Like/unlike a problem
const toggleProblemLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { isLike = true } = req.body;
    
    const problem = await Problem.findById(id);
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    problem.toggleLike(req.user.id, isLike);
    await problem.save();

    res.json({
      success: true,
      message: isLike ? 'Problem liked' : 'Problem disliked',
      data: {
        likes: problem.likes,
        dislikes: problem.dislikes,
        likeRatio: problem.likeRatio
      }
    });

  } catch (error) {
    console.error('Error toggling problem like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update problem like status',
      error: error.message
    });
  }
};

module.exports = {
  getProblems,
  getProblemById,
  getProblemStats,
  getTrendingProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  toggleProblemLike
};
