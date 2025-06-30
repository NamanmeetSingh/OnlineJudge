const { Problem, TestCase } = require('../models');
const mongoose = require('mongoose');

class ProblemController {
  // Get all active problems with pagination
  static async getProblems(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        difficulty, 
        tags, 
        search 
      } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build query for active problems only
      const query = { isActive: true };

      if (difficulty) {
        query.difficulty = difficulty;
      }

      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : tags.split(',');
        query.tags = { $in: tagArray };
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const problems = await Problem.find(query)
        .select('title slug difficulty tags points acceptanceRate totalSubmissions')
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

  // Get single problem by slug
  static async getProblemBySlug(req, res) {
    try {
      const { slug } = req.params;

      const problem = await Problem.findOne({ slug, isActive: true })
        .populate('createdBy', 'name')
        .select('-testCases'); // Don't expose hidden test cases

      if (!problem) {
        return res.status(404).json({
          success: false,
          message: 'Problem not found'
        });
      }

      res.json({
        success: true,
        data: { problem }
      });
    } catch (error) {
      console.error('Get problem error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch problem'
      });
    }
  }
  // Get visible test cases for a problem
  static async getVisibleTestCases(req, res) {
    try {
      const { slug } = req.params;

      const problem = await Problem.findOne({ slug, isActive: true })
        .populate({
          path: 'testCases',
          match: { isVisible: true },
          select: 'input expectedOutput points'
        });

      if (!problem) {
        return res.status(404).json({
          success: false,
          message: 'Problem not found'
        });
      }

      res.json({
        success: true,
        data: {
          sampleTestCases: problem.sampleTestCases,
          visibleTestCases: problem.testCases.filter(tc => tc.isVisible)
        }
      });
    } catch (error) {
      console.error('Get test cases error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch test cases'
      });
    }
  }

  // Get problems by difficulty
  static async getProblemsByDifficulty(req, res) {
    try {
      const { difficulty } = req.params;
      const { page = 1, limit = 10 } = req.query;

      if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid difficulty level'
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const problems = await Problem.find({ difficulty, isActive: true })
        .select('title slug difficulty tags points acceptanceRate')
        .sort({ acceptanceRate: 1, totalSubmissions: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalCount = await Problem.countDocuments({ difficulty, isActive: true });

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
      console.error('Get problems by difficulty error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch problems'
      });
    }
  }

  // Get random problem
  static async getRandomProblem(req, res) {
    try {
      const { difficulty } = req.query;
      
      const query = { isActive: true };
      if (difficulty) {
        query.difficulty = difficulty;
      }

      const count = await Problem.countDocuments(query);
      if (count === 0) {
        return res.status(404).json({
          success: false,
          message: 'No problems found'
        });
      }

      const random = Math.floor(Math.random() * count);
      const problem = await Problem.findOne(query)
        .skip(random)
        .select('title slug difficulty tags points');

      res.json({
        success: true,
        data: { problem }
      });
    } catch (error) {
      console.error('Get random problem error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch random problem'
      });
    }
  }

  // Get problem statistics
  static async getProblemStats(req, res) {
    try {
      const stats = await Problem.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$difficulty',
            count: { $sum: 1 },
            avgAcceptanceRate: { $avg: '$acceptanceRate' },
            totalSubmissions: { $sum: '$totalSubmissions' }
          }
        }
      ]);

      const totalProblems = await Problem.countDocuments({ isActive: true });
      const totalSubmissions = await Problem.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$totalSubmissions' } } }
      ]);

      res.json({
        success: true,
        data: {
          totalProblems,
          totalSubmissions: totalSubmissions[0]?.total || 0,
          byDifficulty: stats
        }
      });
    } catch (error) {
      console.error('Get problem stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch problem statistics'
      });
    }
  }
}

module.exports = ProblemController;
