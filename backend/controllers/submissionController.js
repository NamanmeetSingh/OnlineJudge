const { Submission, Problem, User } = require('../models');
const axios = require('axios');

class SubmissionController {
  // Create a new submission
  static async createSubmission(req, res) {
    try {
      const { problemId, code, language } = req.body;
      const userId = req.user.id;      // Validate problem exists
      const problem = await Problem.findById(problemId).populate('testCases');
      if (!problem) {
        return res.status(404).json({
          success: false,
          message: 'Problem not found'
        });
      }

      // Create submission record
      const submission = new Submission({
        user: userId,
        problem: problemId,
        code,
        language,
        status: 'Pending',
        submittedAt: new Date()
      });

      await submission.save();

      // Prepare test cases for compiler service
      const testCases = problem.testCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput
      }));

      // Execute code against test cases
      try {
        const compilerResponse = await axios.post(
          `${process.env.COMPILER_SERVICE_URL}/api/execute/submit`,
          {
            code,
            language,
            testCases,
            problemId: problemId,
            stopOnFirstFailure: false
          },
          {
            timeout: 30000,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const result = compilerResponse.data.data;
        
        // Update submission with results
        submission.status = result.verdict;
        submission.executionTime = result.totalExecutionTime;
        submission.memoryUsed = result.memoryUsed || 0;
        submission.passedTestCases = result.passedTests;
        submission.totalTestCases = result.totalTests;
        submission.output = result.output;
        submission.error = result.error;
        submission.judgedAt = new Date();

        await submission.save();

        // Update problem statistics
        problem.totalSubmissions += 1;
        if (result.verdict === 'Accepted') {
          problem.acceptedSubmissions += 1;
        }
        problem.acceptanceRate = (problem.acceptedSubmissions / problem.totalSubmissions) * 100;
        await problem.save();

        // Update user statistics
        const user = await User.findById(userId);
        if (user) {
          user.totalSubmissions = (user.totalSubmissions || 0) + 1;
          if (result.verdict === 'Accepted') {
            user.acceptedSubmissions = (user.acceptedSubmissions || 0) + 1;
            user.points = (user.points || 0) + problem.points;
          }
          await user.save();
        }

        res.status(201).json({
          success: true,
          data: {
            submission: {
              id: submission._id,
              status: submission.status,
              executionTime: submission.executionTime,
              memoryUsed: submission.memoryUsed,
              passedTestCases: submission.passedTestCases,
              totalTestCases: submission.totalTestCases,
              submittedAt: submission.submittedAt,
              judgedAt: submission.judgedAt
            }
          }
        });

      } catch (compilerError) {
        console.error('Compiler service error:', compilerError);
        
        // Update submission with error
        submission.status = 'System Error';
        submission.error = 'Failed to execute code due to system error';
        submission.judgedAt = new Date();
        await submission.save();

        res.status(500).json({
          success: false,
          message: 'Code execution failed',
          data: {
            submission: {
              id: submission._id,
              status: submission.status,
              error: submission.error
            }
          }
        });
      }

    } catch (error) {
      console.error('Create submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create submission'
      });
    }
  }

  // Get user submissions
  static async getUserSubmissions(req, res) {
    try {
      const { page = 1, limit = 10, status, problemId } = req.query;
      const userId = req.user.id;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const query = { user: userId };
      
      if (status) {
        query.status = status;
      }
      
      if (problemId) {
        query.problem = problemId;
      }

      const submissions = await Submission.find(query)
        .populate('problem', 'title slug difficulty points')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-code'); // Don't return code in list view

      const totalCount = await Submission.countDocuments(query);

      res.json({
        success: true,
        data: {
          submissions,
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
      console.error('Get user submissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch submissions'
      });
    }
  }

  // Get submission details
  static async getSubmission(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const submission = await Submission.findOne({ 
        _id: id, 
        user: userId 
      }).populate('problem', 'title slug difficulty points');

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }

      res.json({
        success: true,
        data: { submission }
      });

    } catch (error) {
      console.error('Get submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch submission'
      });
    }
  }

  // Run code (test execution without submission)
  static async runCode(req, res) {
    try {
      const { code, language, stdin = '' } = req.body;

      // Execute code with compiler service
      const compilerResponse = await axios.post(
        `${process.env.COMPILER_SERVICE_URL}/api/execute/run`,
        {
          code,
          language,
          stdin
        },
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      res.json({
        success: true,
        data: compilerResponse.data.data
      });

    } catch (error) {
      console.error('Run code error:', error);
      
      if (error.response) {
        res.status(error.response.status).json({
          success: false,
          message: error.response.data.message || 'Code execution failed',
          data: error.response.data.data || null
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to execute code'
        });
      }
    }
  }

  // Get all submissions (admin only)
  static async getAllSubmissions(req, res) {
    try {
      const { page = 1, limit = 10, status, userId, problemId } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const query = {};
      
      if (status) {
        query.status = status;
      }
      
      if (userId) {
        query.user = userId;
      }
      
      if (problemId) {
        query.problem = problemId;
      }

      const submissions = await Submission.find(query)
        .populate('user', 'name email')
        .populate('problem', 'title slug difficulty')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-code');

      const totalCount = await Submission.countDocuments(query);

      res.json({
        success: true,
        data: {
          submissions,
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
      console.error('Get all submissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch submissions'
      });
    }
  }
}

module.exports = SubmissionController;
