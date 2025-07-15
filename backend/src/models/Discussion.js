const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Discussion title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Discussion content is required'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['General', 'Problems', 'Contests', 'Announcements', 'Help', 'Tutorials', 'Off-Topic'],
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  },
  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  viewedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  dislikes: {
    type: Number,
    default: 0,
    min: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Reply content is required'],
      trim: true
    },
    likes: {
      type: Number,
      default: 0,
      min: 0
    },
    dislikes: {
      type: Number,
      default: 0,
      min: 0
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    dislikedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isApproved: {
      type: Boolean,
      default: true
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date
    },
    parentReply: {
      type: mongoose.Schema.Types.ObjectId
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  replyCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastReplyAt: {
    type: Date
  },
  lastReplyBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  closedAt: {
    type: Date
  },
  closeReason: {
    type: String,
    trim: true
  },
  isSticky: {
    type: Boolean,
    default: false
  },
  stickyUntil: {
    type: Date
  },
  isHot: {
    type: Boolean,
    default: false
  },
  hotScore: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  editReason: {
    type: String,
    trim: true
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  moderationNote: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
discussionSchema.index({ author: 1 });
discussionSchema.index({ category: 1 });
discussionSchema.index({ tags: 1 });
discussionSchema.index({ problem: 1 });
discussionSchema.index({ contest: 1 });
discussionSchema.index({ isPinned: -1, isSticky: -1, hotScore: -1, lastReplyAt: -1 });
discussionSchema.index({ createdAt: -1 });
discussionSchema.index({ views: -1 });
discussionSchema.index({ likes: -1 });
discussionSchema.index({ isApproved: 1, isClosed: 1 });

// Virtual for like ratio
discussionSchema.virtual('likeRatio').get(function() {
  const total = this.likes + this.dislikes;
  if (total === 0) return 0;
  return Math.round((this.likes / total) * 100);
});

// Virtual for activity score (for sorting)
discussionSchema.virtual('activityScore').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const lastReply = this.lastReplyAt || created;
  
  // Age factor (newer discussions get higher score)
  const ageHours = (now - created) / (1000 * 60 * 60);
  const ageFactor = Math.max(0, 1 - (ageHours / (24 * 7))); // Decay over a week
  
  // Recent activity factor
  const recentHours = (now - lastReply) / (1000 * 60 * 60);
  const recentFactor = Math.max(0, 1 - (recentHours / 24)); // Decay over a day
  
  // Engagement factor
  const engagementFactor = Math.log(1 + this.likes + this.replyCount + this.views / 10);
  
  return (ageFactor * 0.3 + recentFactor * 0.4 + engagementFactor * 0.3) * 100;
});

// Pre-save middleware to generate slug
discussionSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    this.slug = baseSlug;
  }
  next();
});

// Pre-save middleware to update reply count and last reply info
discussionSchema.pre('save', function(next) {
  if (this.isModified('replies')) {
    this.replyCount = this.replies.filter(reply => reply.isApproved).length;
    
    if (this.replies.length > 0) {
      const lastReply = this.replies
        .filter(reply => reply.isApproved)
        .sort((a, b) => b.createdAt - a.createdAt)[0];
      
      if (lastReply) {
        this.lastReplyAt = lastReply.createdAt;
        this.lastReplyBy = lastReply.author;
      }
    }
  }
  next();
});

// Pre-save middleware to calculate hot score
discussionSchema.pre('save', function(next) {
  const now = new Date();
  const ageHours = (now - this.createdAt) / (1000 * 60 * 60);
  
  // Wilson score for likes vs dislikes
  const total = this.likes + this.dislikes;
  let score = 0;
  
  if (total > 0) {
    const p = this.likes / total;
    const z = 1.96; // 95% confidence
    const n = total;
    
    score = (p + z * z / (2 * n) - z * Math.sqrt((p * (1 - p) + z * z / (4 * n)) / n)) / (1 + z * z / n);
  }
  
  // Combine with recency and activity
  const timeDecay = Math.pow(ageHours + 2, -1.5);
  const activityBoost = Math.log(1 + this.replyCount + this.views / 10);
  
  this.hotScore = (score * 100 + activityBoost) * timeDecay;
  this.isHot = this.hotScore > 10 && ageHours < 168; // Hot if score > 10 and less than a week old
  
  next();
});

// Method to increment view count
discussionSchema.methods.incrementView = function(userId = null) {
  this.views += 1;
  
  if (userId) {
    // Check if user already viewed
    const existingView = this.viewedBy.find(v => v.user.toString() === userId.toString());
    if (!existingView) {
      this.viewedBy.push({
        user: userId,
        viewedAt: new Date()
      });
    }
  }
};

// Method to toggle like/dislike
discussionSchema.methods.toggleLike = function(userId, isLike = true) {
  const likedIndex = this.likedBy.indexOf(userId);
  const dislikedIndex = this.dislikedBy.indexOf(userId);
  
  if (isLike) {
    // Handle like
    if (likedIndex === -1) {
      // Add like
      this.likedBy.push(userId);
      this.likes += 1;
      
      // Remove dislike if exists
      if (dislikedIndex !== -1) {
        this.dislikedBy.splice(dislikedIndex, 1);
        this.dislikes -= 1;
      }
    } else {
      // Remove like
      this.likedBy.splice(likedIndex, 1);
      this.likes -= 1;
    }
  } else {
    // Handle dislike
    if (dislikedIndex === -1) {
      // Add dislike
      this.dislikedBy.push(userId);
      this.dislikes += 1;
      
      // Remove like if exists
      if (likedIndex !== -1) {
        this.likedBy.splice(likedIndex, 1);
        this.likes -= 1;
      }
    } else {
      // Remove dislike
      this.dislikedBy.splice(dislikedIndex, 1);
      this.dislikes -= 1;
    }
  }
};

// Method to add reply
discussionSchema.methods.addReply = function(authorId, content, parentReplyId = null) {
  if (this.isLocked || this.isClosed) {
    throw new Error('Cannot reply to locked or closed discussion');
  }
  
  const reply = {
    author: authorId,
    content: content.trim(),
    parentReply: parentReplyId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  this.replies.push(reply);
  
  // Update last reply info
  this.lastReplyAt = reply.createdAt;
  this.lastReplyBy = authorId;
  this.replyCount += 1;
  
  return this.replies[this.replies.length - 1];
};

// Method to edit reply
discussionSchema.methods.editReply = function(replyId, newContent, userId) {
  const reply = this.replies.id(replyId);
  if (!reply) {
    throw new Error('Reply not found');
  }
  
  if (reply.author.toString() !== userId.toString()) {
    throw new Error('Not authorized to edit this reply');
  }
  
  reply.content = newContent.trim();
  reply.isEdited = true;
  reply.editedAt = new Date();
  reply.updatedAt = new Date();
  
  return reply;
};

// Method to delete reply
discussionSchema.methods.deleteReply = function(replyId, userId, isAdmin = false) {
  const replyIndex = this.replies.findIndex(r => r._id.toString() === replyId.toString());
  if (replyIndex === -1) {
    throw new Error('Reply not found');
  }
  
  const reply = this.replies[replyIndex];
  if (!isAdmin && reply.author.toString() !== userId.toString()) {
    throw new Error('Not authorized to delete this reply');
  }
  
  this.replies.splice(replyIndex, 1);
  this.replyCount = Math.max(0, this.replyCount - 1);
  
  // Update last reply info
  if (this.replies.length > 0) {
    const lastReply = this.replies
      .filter(r => r.isApproved)
      .sort((a, b) => b.createdAt - a.createdAt)[0];
    
    if (lastReply) {
      this.lastReplyAt = lastReply.createdAt;
      this.lastReplyBy = lastReply.author;
    }
  } else {
    this.lastReplyAt = undefined;
    this.lastReplyBy = undefined;
  }
};

// Method to toggle reply like/dislike
discussionSchema.methods.toggleReplyLike = function(replyId, userId, isLike = true) {
  const reply = this.replies.id(replyId);
  if (!reply) {
    throw new Error('Reply not found');
  }
  
  const likedIndex = reply.likedBy.indexOf(userId);
  const dislikedIndex = reply.dislikedBy.indexOf(userId);
  
  if (isLike) {
    // Handle like
    if (likedIndex === -1) {
      reply.likedBy.push(userId);
      reply.likes += 1;
      
      if (dislikedIndex !== -1) {
        reply.dislikedBy.splice(dislikedIndex, 1);
        reply.dislikes -= 1;
      }
    } else {
      reply.likedBy.splice(likedIndex, 1);
      reply.likes -= 1;
    }
  } else {
    // Handle dislike
    if (dislikedIndex === -1) {
      reply.dislikedBy.push(userId);
      reply.dislikes += 1;
      
      if (likedIndex !== -1) {
        reply.likedBy.splice(likedIndex, 1);
        reply.likes -= 1;
      }
    } else {
      reply.dislikedBy.splice(dislikedIndex, 1);
      reply.dislikes -= 1;
    }
  }
  
  return reply;
};

// Static method to get discussions with filters
discussionSchema.statics.getFilteredDiscussions = function(filters = {}) {
  const {
    category,
    tags,
    search,
    sortBy = 'recent',
    page = 1,
    limit = 20,
    problemId,
    contestId,
    authorId,
    includeReplies = false
  } = filters;
  
  let query = { 
    isApproved: true,
    isClosed: { $ne: true }
  };
  
  // Apply filters
  if (category && category !== 'All') {
    query.category = category;
  }
  
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (problemId) {
    query.problem = problemId;
  }
  
  if (contestId) {
    query.contest = contestId;
  }
  
  if (authorId) {
    query.author = authorId;
  }
  
  // Sorting options
  const sortOptions = {
    recent: { isPinned: -1, isSticky: -1, lastReplyAt: -1, createdAt: -1 },
    popular: { isPinned: -1, isSticky: -1, likes: -1, views: -1 },
    hot: { isPinned: -1, isSticky: -1, hotScore: -1 },
    oldest: { isPinned: -1, isSticky: -1, createdAt: 1 },
    mostReplied: { isPinned: -1, isSticky: -1, replyCount: -1 },
    mostViewed: { isPinned: -1, isSticky: -1, views: -1 }
  };
  
  const sort = sortOptions[sortBy] || sortOptions.recent;
  
  // Pagination
  const skip = (page - 1) * limit;
  
  let selectFields = '-viewedBy -likedBy -dislikedBy';
  if (!includeReplies) {
    selectFields += ' -replies';
  }
  
  return this.find(query)
    .populate('author', 'name avatar rating')
    .populate('problem', 'title slug difficulty')
    .populate('contest', 'name slug')
    .populate('lastReplyBy', 'name avatar')
    .select(selectFields)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get trending discussions
discussionSchema.statics.getTrendingDiscussions = function(limit = 10) {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  return this.find({
    isApproved: true,
    isClosed: { $ne: true },
    createdAt: { $gte: oneDayAgo }
  })
    .populate('author', 'name avatar rating')
    .populate('problem', 'title slug difficulty')
    .select('-viewedBy -likedBy -dislikedBy -replies')
    .sort({ hotScore: -1, views: -1 })
    .limit(limit);
};

// Static method to get discussion statistics
discussionSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $match: { isApproved: true }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' },
        totalReplies: { $sum: '$replyCount' },
        byCategory: {
          $push: {
            category: '$category',
            count: 1
          }
        }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      total: 0,
      totalViews: 0,
      totalLikes: 0,
      totalReplies: 0,
      byCategory: {}
    };
  }
  
  const result = stats[0];
  
  // Group by category
  const categoryStats = {};
  result.byCategory.forEach(item => {
    categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
  });
  
  delete result._id;
  delete result.byCategory;
  result.byCategory = categoryStats;
  
  return result;
};

module.exports = mongoose.model('Discussion', discussionSchema);
