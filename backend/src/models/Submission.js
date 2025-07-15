const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: [true, 'Problem is required']
  },
  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest'
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    trim: true
  },
  language: {
    type: String,
    required: [true, 'Programming language is required'],
    enum: ['javascript', 'python', 'cpp', 'java', 'c']
  },
  status: {
    type: String,
    required: true,
    enum: [
      'Pending',
      'Running',
      'Accepted',
      'Wrong Answer',
      'Time Limit Exceeded',
      'Memory Limit Exceeded',
      'Runtime Error',
      'Compilation Error',
      'Internal Error'
    ],
    default: 'Pending'
  },
  verdict: {
    type: String,
    enum: ['AC', 'WA', 'TLE', 'MLE', 'RE', 'CE', 'IE'],
    default: function() {
      const verdictMap = {
        'Accepted': 'AC',
        'Wrong Answer': 'WA',
        'Time Limit Exceeded': 'TLE',
        'Memory Limit Exceeded': 'MLE',
        'Runtime Error': 'RE',
        'Compilation Error': 'CE',
        'Internal Error': 'IE'
      };
      return verdictMap[this.status] || null;
    }
  },
  executionTime: {
    type: Number, // in milliseconds
    min: 0
  },
  memoryUsed: {
    type: Number, // in MB
    min: 0
  },
  testCasesPassed: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTestCases: {
    type: Number,
    default: 0,
    min: 0
  },
  testCaseResults: [{
    testCaseId: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Passed', 'Failed', 'Error', 'Timeout'],
      required: true
    },
    executionTime: {
      type: Number,
      min: 0
    },
    memoryUsed: {
      type: Number,
      min: 0
    },
    input: String,
    expectedOutput: String,
    actualOutput: String,
    errorMessage: String
  }],
  compilationError: {
    type: String
  },
  runtimeError: {
    type: String
  },
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  submissionNumber: {
    type: Number,
    default: 1,
    min: 1
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  },
  isContestSubmission: {
    type: Boolean,
    default: false
  },
  contestPenalty: {
    type: Number,
    default: 0,
    min: 0
  },
  submissionTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ problem: 1, createdAt: -1 });
submissionSchema.index({ contest: 1, createdAt: -1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ language: 1 });
submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ user: 1, problem: 1, status: 1 });
submissionSchema.index({ contest: 1, user: 1, problem: 1 });

// Virtual for success rate
submissionSchema.virtual('successRate').get(function() {
  if (this.totalTestCases === 0) return 0;
  return Math.round((this.testCasesPassed / this.totalTestCases) * 100);
});

// Virtual for formatted execution time
submissionSchema.virtual('formattedExecutionTime').get(function() {
  if (!this.executionTime) return 'N/A';
  if (this.executionTime < 1000) {
    return `${this.executionTime}ms`;
  }
  return `${(this.executionTime / 1000).toFixed(2)}s`;
});

// Virtual for formatted memory usage
submissionSchema.virtual('formattedMemoryUsed').get(function() {
  if (!this.memoryUsed) return 'N/A';
  if (this.memoryUsed < 1024) {
    return `${this.memoryUsed}KB`;
  }
  return `${(this.memoryUsed / 1024).toFixed(2)}MB`;
});

// Pre-save middleware to set verdict
submissionSchema.pre('save', function(next) {
  const verdictMap = {
    'Accepted': 'AC',
    'Wrong Answer': 'WA',
    'Time Limit Exceeded': 'TLE',
    'Memory Limit Exceeded': 'MLE',
    'Runtime Error': 'RE',
    'Compilation Error': 'CE',
    'Internal Error': 'IE'
  };
  
  this.verdict = verdictMap[this.status] || null;
  
  // Calculate score based on test cases passed
  if (this.totalTestCases > 0) {
    this.score = Math.round((this.testCasesPassed / this.totalTestCases) * 100);
  }
  
  next();
});

// Pre-save middleware to set submission number
submissionSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const lastSubmission = await this.constructor
        .findOne({ 
          user: this.user, 
          problem: this.problem 
        })
        .sort({ submissionNumber: -1 });
      
      this.submissionNumber = lastSubmission ? lastSubmission.submissionNumber + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to update test case results
submissionSchema.methods.updateTestCaseResults = function(results) {
  this.testCaseResults = results;
  this.testCasesPassed = results.filter(r => r.status === 'Passed').length;
  this.totalTestCases = results.length;
  
  // Determine overall status
  if (this.testCasesPassed === this.totalTestCases) {
    this.status = 'Accepted';
  } else if (results.some(r => r.status === 'Timeout')) {
    this.status = 'Time Limit Exceeded';
  } else if (results.some(r => r.status === 'Error')) {
    this.status = 'Runtime Error';
  } else {
    this.status = 'Wrong Answer';
  }
  
  // Calculate max execution time and memory
  this.executionTime = Math.max(...results.map(r => r.executionTime || 0));
  this.memoryUsed = Math.max(...results.map(r => r.memoryUsed || 0));
};

// Method to set compilation error
submissionSchema.methods.setCompilationError = function(error) {
  this.status = 'Compilation Error';
  this.compilationError = error;
  this.testCasesPassed = 0;
  this.score = 0;
};

// Method to set runtime error
submissionSchema.methods.setRuntimeError = function(error) {
  this.status = 'Runtime Error';
  this.runtimeError = error;
  this.score = 0;
};

// Static method to get user's submission history
submissionSchema.statics.getUserSubmissions = function(userId, filters = {}) {
  const {
    problemId,
    contestId,
    status,
    language,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = filters;
  
  let query = { user: userId };
  
  if (problemId) query.problem = problemId;
  if (contestId) query.contest = contestId;
  if (status) {
    if (Array.isArray(status)) {
      query.status = { $in: status };
    } else {
      query.status = status;
    }
  }
  if (language) {
    if (Array.isArray(language)) {
      query.language = { $in: language };
    } else {
      query.language = language;
    }
  }
  
  const sortOptions = {
    createdAt: { createdAt: sortOrder === 'desc' ? -1 : 1 },
    executionTime: { executionTime: sortOrder === 'desc' ? -1 : 1 },
    memoryUsed: { memoryUsed: sortOrder === 'desc' ? -1 : 1 },
    score: { score: sortOrder === 'desc' ? -1 : 1 }
  };
  
  const sort = sortOptions[sortBy] || sortOptions.createdAt;
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .populate('problem', 'title slug difficulty')
    .populate('contest', 'name')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get problem's submission statistics
submissionSchema.statics.getProblemStats = async function(problemId) {
  const stats = await this.aggregate([
    { $match: { problem: new mongoose.Types.ObjectId(problemId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: 0,
    accepted: 0,
    wrongAnswer: 0,
    timeLimit: 0,
    memoryLimit: 0,
    runtimeError: 0,
    compilationError: 0
  };
  
  stats.forEach(stat => {
    result.total += stat.count;
    switch (stat._id) {
      case 'Accepted':
        result.accepted = stat.count;
        break;
      case 'Wrong Answer':
        result.wrongAnswer = stat.count;
        break;
      case 'Time Limit Exceeded':
        result.timeLimit = stat.count;
        break;
      case 'Memory Limit Exceeded':
        result.memoryLimit = stat.count;
        break;
      case 'Runtime Error':
        result.runtimeError = stat.count;
        break;
      case 'Compilation Error':
        result.compilationError = stat.count;
        break;
    }
  });
  
  result.acceptanceRate = result.total > 0 
    ? Math.round((result.accepted / result.total) * 100)
    : 0;
  
  return result;
};

// Static method to get user's best submission for a problem
submissionSchema.statics.getUserBestSubmission = function(userId, problemId) {
  return this.findOne({
    user: userId,
    problem: problemId,
    status: 'Accepted'
  })
    .sort({ executionTime: 1, memoryUsed: 1, createdAt: 1 })
    .populate('problem', 'title slug difficulty');
};

// Static method to get recent submissions
submissionSchema.statics.getRecentSubmissions = function(limit = 50) {
  return this.find({})
    .populate('user', 'name avatar')
    .populate('problem', 'title slug difficulty')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get contest submissions
submissionSchema.statics.getContestSubmissions = function(contestId, userId = null) {
  let query = { contest: contestId };
  if (userId) query.user = userId;
  
  return this.find(query)
    .populate('user', 'name avatar')
    .populate('problem', 'title slug difficulty order')
    .sort({ createdAt: 1 });
};

module.exports = mongoose.model('Submission', submissionSchema);
