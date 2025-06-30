const { User, UserProgress } = require('../models');

class LeaderboardController {
  // Get leaderboard
  static async getLeaderboard(req, res) {
    try {
      const { 
        page = 1, 
        limit = 50,
        timeframe = 'all', // 'all', 'month', 'week'
        category = 'points' // 'points', 'solved', 'submissions'
      } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Build aggregation pipeline based on category
      let sortField = 'points';
      let pipeline = [];

      switch (category) {
        case 'solved':
          sortField = 'acceptedSubmissions';
          break;
        case 'submissions':
          sortField = 'totalSubmissions';
          break;
        default:
          sortField = 'points';
      }

      // Base match conditions
      const matchConditions = {
        totalSubmissions: { $gt: 0 }
      };

      // Apply timeframe filter if not 'all'
      if (timeframe === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchConditions.lastSubmissionAt = { $gte: monthAgo };
      } else if (timeframe === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchConditions.lastSubmissionAt = { $gte: weekAgo };
      }

      pipeline = [
        { $match: matchConditions },
        {
          $project: {
            name: 1,
            email: 1,
            avatar: 1,
            points: { $ifNull: ['$points', 0] },
            acceptedSubmissions: { $ifNull: ['$acceptedSubmissions', 0] },
            totalSubmissions: { $ifNull: ['$totalSubmissions', 0] },
            lastSubmissionAt: 1,
            joinedAt: '$createdAt',
            acceptanceRate: {
              $cond: {
                if: { $eq: ['$totalSubmissions', 0] },
                then: 0,
                else: {
                  $multiply: [
                    { $divide: ['$acceptedSubmissions', '$totalSubmissions'] },
                    100
                  ]
                }
              }
            }
          }
        },
        { $sort: { [sortField]: -1, acceptedSubmissions: -1, name: 1 } },
        { $skip: skip },
        { $limit: parseInt(limit) }
      ];

      const users = await User.aggregate(pipeline);
      
      // Add rank to each user
      const rankedUsers = users.map((user, index) => ({
        ...user,
        rank: skip + index + 1
      }));

      // Get total count for pagination
      const totalCountPipeline = [
        { $match: matchConditions },
        { $count: "total" }
      ];
      
      const totalCountResult = await User.aggregate(totalCountPipeline);
      const totalCount = totalCountResult.length > 0 ? totalCountResult[0].total : 0;

      res.json({
        success: true,
        data: {
          leaderboard: rankedUsers,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalCount,
            hasNext: skip + parseInt(limit) < totalCount,
            hasPrev: parseInt(page) > 1
          },
          filters: {
            timeframe,
            category
          }
        }
      });

    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leaderboard'
      });
    }
  }

  // Get user rank
  static async getUserRank(req, res) {
    try {
      const { userId } = req.params;
      const { category = 'points' } = req.query;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      let sortField = 'points';
      switch (category) {
        case 'solved':
          sortField = 'acceptedSubmissions';
          break;
        case 'submissions':
          sortField = 'totalSubmissions';
          break;
        default:
          sortField = 'points';
      }

      const userValue = user[sortField] || 0;

      // Count users with better stats
      const betterUsersCount = await User.countDocuments({
        [sortField]: { $gt: userValue },
        totalSubmissions: { $gt: 0 }
      });

      const rank = betterUsersCount + 1;

      // Get total active users count
      const totalActiveUsers = await User.countDocuments({
        totalSubmissions: { $gt: 0 }
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            rank,
            totalActiveUsers,
            percentile: totalActiveUsers > 0 ? 
              Math.round(((totalActiveUsers - rank) / totalActiveUsers) * 100) : 0,
            stats: {
              points: user.points || 0,
              acceptedSubmissions: user.acceptedSubmissions || 0,
              totalSubmissions: user.totalSubmissions || 0,
              acceptanceRate: user.totalSubmissions > 0 ? 
                Math.round((user.acceptedSubmissions / user.totalSubmissions) * 100) : 0
            }
          }
        }
      });

    } catch (error) {
      console.error('Get user rank error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user rank'
      });
    }
  }

  // Get leaderboard statistics
  static async getLeaderboardStats(req, res) {
    try {
      const stats = await User.aggregate([
        {
          $match: {
            totalSubmissions: { $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            totalSubmissions: { $sum: '$totalSubmissions' },
            totalAcceptedSubmissions: { $sum: '$acceptedSubmissions' },
            totalPoints: { $sum: '$points' },
            avgPoints: { $avg: '$points' },
            avgAcceptanceRate: {
              $avg: {
                $cond: {
                  if: { $eq: ['$totalSubmissions', 0] },
                  then: 0,
                  else: {
                    $multiply: [
                      { $divide: ['$acceptedSubmissions', '$totalSubmissions'] },
                      100
                    ]
                  }
                }
              }
            }
          }
        }
      ]);

      const result = stats.length > 0 ? stats[0] : {
        totalUsers: 0,
        totalSubmissions: 0,
        totalAcceptedSubmissions: 0,
        totalPoints: 0,
        avgPoints: 0,
        avgAcceptanceRate: 0
      };

      res.json({
        success: true,
        data: {
          stats: {
            totalUsers: result.totalUsers,
            totalSubmissions: result.totalSubmissions,
            totalAcceptedSubmissions: result.totalAcceptedSubmissions,
            totalPoints: result.totalPoints,
            avgPoints: Math.round(result.avgPoints || 0),
            avgAcceptanceRate: Math.round(result.avgAcceptanceRate || 0),
            overallAcceptanceRate: result.totalSubmissions > 0 ? 
              Math.round((result.totalAcceptedSubmissions / result.totalSubmissions) * 100) : 0
          }
        }
      });

    } catch (error) {
      console.error('Get leaderboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leaderboard statistics'
      });
    }
  }
}

module.exports = LeaderboardController;
