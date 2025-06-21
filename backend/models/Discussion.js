const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // What this discussion is related to
  relatedTo: {    type: {
      type: String,
      enum: ['problem', 'contest', 'general', 'announcement'],
      required: true,
      index: true
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      index: true
    },
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest',
      index: true
    }
  },
    category: {
    type: String,
    enum: [
      'question', 
      'solution', 
      'editorial', 
      'hint', 
      'bug_report', 
      'feature_request', 
      'general_discussion',
      'announcement'
    ],
    required: true,
    index: true
  },
  
  tags: [{
    type: String,
    trim: true,
    index: true
  }],
  
  // Replies/Comments
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    isEdited: {
      type: Boolean,
      default: false
    },
    parentReplyId: {
      type: mongoose.Schema.Types.ObjectId // For nested replies
    }
  }],
  
  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }  }],
  
  // Moderation
  isPinned: {
    type: Boolean,
    default: false,
    index: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderationNote: {
    type: String
  },
  
  // For problem-specific discussions
  spoilerWarning: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard']
  },
    lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});



// Virtual for like count
discussionSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for reply count
discussionSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Pre-save hook to update lastActivity
discussionSchema.pre('save', function(next) {
  if (this.isModified('replies')) {
    this.lastActivity = new Date();
  }
  next();
});

// Instance method to add a like
discussionSchema.methods.addLike = function(userId) {
  if (!this.likes.some(like => like.userId.equals(userId))) {
    this.likes.push({ userId });
  }
  return this.save();
};

// Instance method to remove a like
discussionSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => !like.userId.equals(userId));
  return this.save();
};

// Instance method to add a reply
discussionSchema.methods.addReply = function(replyData) {
  this.replies.push({
    ...replyData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  this.lastActivity = new Date();
  return this.save();
};

// Instance method to increment views
discussionSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static method to get discussions by problem
discussionSchema.statics.getByProblem = function(problemId, category = null) {
  const query = { 
    'relatedTo.type': 'problem', 
    'relatedTo.problemId': problemId,
    isApproved: true 
  };
  
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
    .sort({ isPinned: -1, lastActivity: -1 })
    .populate('author', 'name avatar')
    .populate('replies.author', 'name avatar');
};

// Static method to get trending discussions
discussionSchema.statics.getTrending = function(limit = 10) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        lastActivity: { $gte: oneDayAgo },
        isApproved: true
      }
    },
    {
      $addFields: {
        engagementScore: {
          $add: [
            { $size: '$likes' },
            { $multiply: [{ $size: '$replies' }, 2] },
            { $divide: ['$views', 10] }
          ]
        }
      }
    },
    { $sort: { engagementScore: -1 } },
    { $limit: limit }
  ]);
};

// Static method to search discussions
discussionSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ],
    isApproved: true
  };
  
  // Apply filters
  if (filters.category) {
    searchQuery.category = filters.category;
  }
  
  if (filters.relatedType) {
    searchQuery['relatedTo.type'] = filters.relatedType;
  }
  
  if (filters.tags && filters.tags.length > 0) {
    searchQuery.tags = { $in: filters.tags };
  }
  
  return this.find(searchQuery)
    .sort({ lastActivity: -1 })
    .populate('author', 'name avatar')
    .populate('relatedTo.problemId', 'title slug difficulty')
    .populate('relatedTo.contestId', 'title slug');
};

module.exports = mongoose.model('Discussion', discussionSchema);
