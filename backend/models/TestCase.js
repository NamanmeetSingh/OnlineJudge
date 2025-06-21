const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
    index: true
  },
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },  isHidden: {
    type: Boolean,
    default: true, // Most test cases are hidden from users
    index: true
  },
  weight: {
    type: Number,
    default: 1 // Weight for scoring if different test cases have different importance
  },  group: {
    type: String,
    default: 'default', // For grouping test cases (e.g., 'basic', 'edge_cases', 'performance')
    index: true
  },
  timeLimit: {
    type: Number, // Override problem's time limit if needed
  },
  memoryLimit: {
    type: Number, // Override problem's memory limit if needed
  },
  description: {
    type: String // Internal description for the test case
  }
}, {
  timestamps: true
});

// Static method to get test cases for a problem
testCaseSchema.statics.getByProblem = function(problemId, includeHidden = false) {
  const query = { problemId };
  if (!includeHidden) {
    query.isHidden = false;
  }
  return this.find(query).sort({ createdAt: 1 });
};

// Static method to get test cases by group
testCaseSchema.statics.getByGroup = function(problemId, group) {
  return this.find({ problemId, group }).sort({ createdAt: 1 });
};

module.exports = mongoose.model('TestCase', testCaseSchema);
