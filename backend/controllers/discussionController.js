const { Discussion, User } = require('../models');

class DiscussionController {
  // Get all discussions
  static async getDiscussions(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        tags, 
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const query = {};

      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : tags.split(',');
        query.tags = { $in: tagArray };
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ];
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const discussions = await Discussion.find(query)
        .populate('author', 'name avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

      const totalCount = await Discussion.countDocuments(query);

      res.json({
        success: true,
        data: {
          discussions,
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
      console.error('Get discussions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch discussions'
      });
    }
  }

  // Get single discussion by ID
  static async getDiscussion(req, res) {
    try {
      const { id } = req.params;

      const discussion = await Discussion.findById(id)
        .populate('author', 'name avatar')
        .populate('replies.author', 'name avatar');

      if (!discussion) {
        return res.status(404).json({
          success: false,
          message: 'Discussion not found'
        });
      }

      // Increment view count
      discussion.views += 1;
      await discussion.save();

      res.json({
        success: true,
        data: { discussion }
      });

    } catch (error) {
      console.error('Get discussion error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch discussion'
      });
    }
  }

  // Create new discussion
  static async createDiscussion(req, res) {
    try {
      const { title, content, tags = [] } = req.body;
      const userId = req.user.id;

      const discussion = new Discussion({
        title,
        content,
        tags,
        author: userId,
        createdAt: new Date()
      });

      await discussion.save();
      await discussion.populate('author', 'name avatar');

      res.status(201).json({
        success: true,
        data: { discussion }
      });

    } catch (error) {
      console.error('Create discussion error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create discussion'
      });
    }
  }

  // Update discussion
  static async updateDiscussion(req, res) {
    try {
      const { id } = req.params;
      const { title, content, tags } = req.body;
      const userId = req.user.id;

      const discussion = await Discussion.findOne({ _id: id, author: userId });

      if (!discussion) {
        return res.status(404).json({
          success: false,
          message: 'Discussion not found or not authorized'
        });
      }

      if (title) discussion.title = title;
      if (content) discussion.content = content;
      if (tags) discussion.tags = tags;
      discussion.updatedAt = new Date();

      await discussion.save();
      await discussion.populate('author', 'name avatar');

      res.json({
        success: true,
        data: { discussion }
      });

    } catch (error) {
      console.error('Update discussion error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update discussion'
      });
    }
  }

  // Delete discussion
  static async deleteDiscussion(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const discussion = await Discussion.findOne({ _id: id, author: userId });

      if (!discussion) {
        return res.status(404).json({
          success: false,
          message: 'Discussion not found or not authorized'
        });
      }

      await Discussion.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Discussion deleted successfully'
      });

    } catch (error) {
      console.error('Delete discussion error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete discussion'
      });
    }
  }

  // Add reply to discussion
  static async addReply(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      const discussion = await Discussion.findById(id);

      if (!discussion) {
        return res.status(404).json({
          success: false,
          message: 'Discussion not found'
        });
      }

      const reply = {
        content,
        author: userId,
        createdAt: new Date()
      };

      discussion.replies.push(reply);
      discussion.replyCount = discussion.replies.length;
      discussion.lastReplyAt = new Date();
      
      await discussion.save();
      await discussion.populate('replies.author', 'name avatar');

      res.status(201).json({
        success: true,
        data: { 
          reply: discussion.replies[discussion.replies.length - 1]
        }
      });

    } catch (error) {
      console.error('Add reply error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add reply'
      });
    }
  }

  // Vote on discussion
  static async voteDiscussion(req, res) {
    try {
      const { id } = req.params;
      const { voteType } = req.body; // 'up' or 'down'
      const userId = req.user.id;

      const discussion = await Discussion.findById(id);

      if (!discussion) {
        return res.status(404).json({
          success: false,
          message: 'Discussion not found'
        });
      }

      // Remove existing vote if any
      discussion.upvotes = discussion.upvotes.filter(vote => vote.toString() !== userId);
      discussion.downvotes = discussion.downvotes.filter(vote => vote.toString() !== userId);

      // Add new vote
      if (voteType === 'up') {
        discussion.upvotes.push(userId);
      } else if (voteType === 'down') {
        discussion.downvotes.push(userId);
      }

      discussion.score = discussion.upvotes.length - discussion.downvotes.length;
      await discussion.save();

      res.json({
        success: true,
        data: {
          score: discussion.score,
          upvotes: discussion.upvotes.length,
          downvotes: discussion.downvotes.length
        }
      });

    } catch (error) {
      console.error('Vote discussion error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to vote on discussion'
      });
    }
  }
}

module.exports = DiscussionController;
