const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Problem title is required'],
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
  description: {
    type: String,
    required: [true, 'Problem description is required'],
    trim: true
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Array', 'String', 'Hash Table', 'Dynamic Programming', 
      'Math', 'Greedy', 'Sorting', 'Depth-First Search', 
      'Binary Search', 'Database', 'Breadth-First Search',
      'Tree', 'Matrix', 'Two Pointers', 'Bit Manipulation',
      'Stack', 'Design', 'Heap', 'Graph', 'Simulation',
      'Backtracking', 'Linked List', 'Union Find', 'Sliding Window',
      'Getting Started'
    ]
  },
  constraints: {
    type: String,
    required: [true, 'Constraints are required']
  },
  examples: [{
    input: {
      type: String,
      default: ''
    },
    output: {
      type: String,
      required: true
    },
    explanation: {
      type: String
    }
  }],
  testCases: [{
    input: {
      type: String,
      default: ''
    },
    expectedOutput: {
      type: String,
      required: true
    },
    isHidden: {
      type: Boolean,
      default: false
    },
    timeLimit: {
      type: Number,
      default: 2000 // milliseconds
    },
    memoryLimit: {
      type: Number,
      default: 256 // MB
    }
  }],
  hints: [{
    type: String,
    trim: true
  }],
  solution: {
    approach: {
      type: String
    },
    timeComplexity: {
      type: String
    },
    spaceComplexity: {
      type: String
    },
    code: {
      javascript: String,
      python: String,
      cpp: String,
      java: String,
      c: String
    }
  },
  starterCode: {
    javascript: String,
    python: String,
    cpp: String,
    java: String,
    c: String
  },
  totalSubmissions: {
    type: Number,
    default: 0,
    min: 0
  },
  acceptedSubmissions: {
    type: Number,
    default: 0,
    min: 0
  },
  acceptanceRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
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
  discussionCount: {
    type: Number,
    default: 0,
    min: 0
  },
  premium: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest'
  },
  order: {
    type: Number,
    default: 0
  },
  points: {
    easy: {
      type: Number,
      default: 100
    },
    medium: {
      type: Number,
      default: 200
    },
    hard: {
      type: Number,
      default: 300
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
problemSchema.index({ difficulty: 1 });
problemSchema.index({ category: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ acceptanceRate: -1 });
problemSchema.index({ likes: -1 });
problemSchema.index({ createdAt: -1 });
problemSchema.index({ contestId: 1, order: 1 });
problemSchema.index({ isActive: 1 });

// Virtual for actual points based on difficulty
problemSchema.virtual('actualPoints').get(function() {
  return this.points[this.difficulty.toLowerCase()] || 100;
});

// Virtual for like ratio
problemSchema.virtual('likeRatio').get(function() {
  const total = this.likes + this.dislikes;
  if (total === 0) return 0;
  return Math.round((this.likes / total) * 100);
});

// Pre-save middleware to generate slug
problemSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Pre-save middleware to calculate acceptance rate
problemSchema.pre('save', function(next) {
  if (this.totalSubmissions > 0) {
    this.acceptanceRate = Math.round((this.acceptedSubmissions / this.totalSubmissions) * 100);
  } else {
    this.acceptanceRate = 0;
  }
  next();
});

// Method to update submission stats
problemSchema.methods.updateSubmissionStats = function(isAccepted = false) {
  this.totalSubmissions += 1;
  if (isAccepted) {
    this.acceptedSubmissions += 1;
  }
  this.acceptanceRate = Math.round((this.acceptedSubmissions / this.totalSubmissions) * 100);
};

// Method to toggle like/dislike
problemSchema.methods.toggleLike = function(userId, isLike = true) {
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

// Static method to get problems with filters
problemSchema.statics.getFilteredProblems = function(filters = {}) {
  const {
    difficulty,
    category,
    tags,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
    premium,
    contestId
  } = filters;
  
  let query = { isActive: true };
  
  // Apply filters
  if (difficulty) {
    if (Array.isArray(difficulty)) {
      query.difficulty = { $in: difficulty };
    } else {
      query.difficulty = difficulty;
    }
  }
  
  if (category) {
    if (Array.isArray(category)) {
      query.category = { $in: category };
    } else {
      query.category = category;
    }
  }
  
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (premium !== undefined) {
    query.premium = premium;
  }
  
  if (contestId) {
    query.contestId = contestId;
  }
  
  // Sorting options
  const sortOptions = {
    createdAt: { createdAt: sortOrder === 'desc' ? -1 : 1 },
    difficulty: { difficulty: sortOrder === 'desc' ? -1 : 1, createdAt: -1 },
    acceptance: { acceptanceRate: sortOrder === 'desc' ? -1 : 1, createdAt: -1 },
    likes: { likes: sortOrder === 'desc' ? -1 : 1, createdAt: -1 },
    submissions: { totalSubmissions: sortOrder === 'desc' ? -1 : 1, createdAt: -1 },
    title: { title: sortOrder === 'desc' ? -1 : 1 }
  };
  
  const sort = sortOptions[sortBy] || sortOptions.createdAt;
  
  // Pagination
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .populate('createdBy', 'name avatar')
    .select('-testCases -solution')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get problem statistics
problemSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        easy: {
          $sum: {
            $cond: [{ $eq: ['$difficulty', 'Easy'] }, 1, 0]
          }
        },
        medium: {
          $sum: {
            $cond: [{ $eq: ['$difficulty', 'Medium'] }, 1, 0]
          }
        },
        hard: {
          $sum: {
            $cond: [{ $eq: ['$difficulty', 'Hard'] }, 1, 0]
          }
        },
        totalSubmissions: { $sum: '$totalSubmissions' },
        totalAccepted: { $sum: '$acceptedSubmissions' }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      total: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      totalSubmissions: 0,
      totalAccepted: 0,
      overallAcceptanceRate: 0
    };
  }
  
  const result = stats[0];
  result.overallAcceptanceRate = result.totalSubmissions > 0 
    ? Math.round((result.totalAccepted / result.totalSubmissions) * 100)
    : 0;
  
  delete result._id;
  return result;
};

// Static method to get trending problems
problemSchema.statics.getTrendingProblems = function(limit = 10) {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  return this.find({
    isActive: true,
    updatedAt: { $gte: oneDayAgo }
  })
    .populate('createdBy', 'name avatar')
    .select('-testCases -solution')
    .sort({ totalSubmissions: -1, likes: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Problem', problemSchema);
