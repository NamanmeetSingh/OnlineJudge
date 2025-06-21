const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'typescript'],
    required: true
  },  status: {
    type: String,
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
    default: 'Pending',
    index: true
  },
  testCaseResults: [{
    testCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestCase'
    },
    status: {
      type: String,
      enum: ['Passed', 'Failed', 'Error', 'Timeout', 'Memory Exceeded']
    },
    executionTime: {
      type: Number // in milliseconds
    },
    memoryUsed: {
      type: Number // in KB
    },
    actualOutput: {
      type: String
    },
    errorMessage: {
      type: String
    }
  }],
  overallResult: {
    executionTime: {
      type: Number // Total execution time in milliseconds
    },
    memoryUsed: {
      type: Number // Peak memory usage in KB
    },
    testCasesPassed: {
      type: Number,
      default: 0
    },
    totalTestCases: {
      type: Number,
      default: 0
    },
    score: {
      type: Number,
      default: 0
    }
  },
  compilationError: {
    type: String
  },
  runtimeError: {
    type: String
  },
  isPublic: {
    type: Boolean,
    default: false // Whether other users can view this submission
  },  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    index: true
  },
  submissionTime: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Virtual for success rate
submissionSchema.virtual('successRate').get(function() {
  if (this.overallResult.totalTestCases === 0) return 0;
  return Math.round((this.overallResult.testCasesPassed / this.overallResult.totalTestCases) * 100);
});

// Pre-save hook to calculate overall results
submissionSchema.pre('save', function(next) {
  if (this.testCaseResults && this.testCaseResults.length > 0) {
    this.overallResult.totalTestCases = this.testCaseResults.length;
    this.overallResult.testCasesPassed = this.testCaseResults.filter(result => result.status === 'Passed').length;
    
    // Calculate total execution time and peak memory
    this.overallResult.executionTime = this.testCaseResults.reduce((total, result) => total + (result.executionTime || 0), 0);
    this.overallResult.memoryUsed = Math.max(...this.testCaseResults.map(result => result.memoryUsed || 0));
    
    // Calculate score based on passed test cases
    if (this.overallResult.totalTestCases > 0) {
      this.overallResult.score = Math.round((this.overallResult.testCasesPassed / this.overallResult.totalTestCases) * 100);
    }
  }
  next();
});

// Static method to get user's submissions for a problem
submissionSchema.statics.getUserSubmissions = function(userId, problemId, limit = 10) {
  return this.find({ userId, problemId })
    .sort({ submissionTime: -1 })
    .limit(limit)
    .populate('problemId', 'title slug difficulty');
};

// Static method to get recent submissions
submissionSchema.statics.getRecentSubmissions = function(limit = 50) {
  return this.find()
    .sort({ submissionTime: -1 })
    .limit(limit)
    .populate('userId', 'name email')
    .populate('problemId', 'title slug difficulty');
};

// Static method to get accepted submissions for a problem
submissionSchema.statics.getAcceptedSubmissions = function(problemId, limit = 10) {
  return this.find({ problemId, status: 'Accepted' })
    .sort({ submissionTime: -1 })
    .limit(limit)
    .populate('userId', 'name')
    .select('userId language overallResult.executionTime overallResult.memoryUsed submissionTime');
};

module.exports = mongoose.model('Submission', submissionSchema);
