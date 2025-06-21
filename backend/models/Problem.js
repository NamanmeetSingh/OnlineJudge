const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    index: true
  }],
  constraints: {
    type: String
  },
  inputFormat: {
    type: String,
    required: true
  },
  outputFormat: {
    type: String,
    required: true
  },
  sampleTestCases: [{
    input: {
      type: String,
      required: true
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestCase'
  }],
  timeLimit: {
    type: Number, // in milliseconds
    default: 1000
  },
  memoryLimit: {
    type: Number, // in MB
    default: 256
  },  points: {
    type: Number,
    default: 100,
    index: true
  },
  acceptedSubmissions: {
    type: Number,
    default: 0
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },  acceptanceRate: {
    type: Number,
    default: 0,
    index: true
  },isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  editorialContent: {
    type: String
  },
  hints: [{
    type: String
  }],
  companies: [{
    type: String
  }],
  similarProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }]
}, {
  timestamps: true
});

// Virtual for URL
problemSchema.virtual('url').get(function() {
  return `/problems/${this.slug}`;
});

// Update acceptance rate before saving
problemSchema.pre('save', function(next) {
  if (this.totalSubmissions > 0) {
    this.acceptanceRate = Math.round((this.acceptedSubmissions / this.totalSubmissions) * 100);
  }
  next();
});

// Static method to get problems by difficulty
problemSchema.statics.getByDifficulty = function(difficulty) {
  return this.find({ difficulty, isActive: true }).sort({ createdAt: -1 });
};

// Static method to get problems by tags
problemSchema.statics.getByTags = function(tags) {
  return this.find({ tags: { $in: tags }, isActive: true }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Problem', problemSchema);
