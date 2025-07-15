const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  avatar: {
    type: String,
    default: function() {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=random`;
    }
  },
  rating: {
    type: Number,
    default: 1200,
    min: 0,
    max: 5000
  },
  problemsSolved: {
    type: Number,
    default: 0,
    min: 0
  },
  submissions: {
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
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastSolvedDate: {
    type: Date
  },
  rank: {
    type: Number,
    default: null
  },
  contestsParticipated: {
    type: Number,
    default: 0,
    min: 0
  },
  contestsWon: {
    type: Number,
    default: 0,
    min: 0
  },
  totalScore: {
    type: Number,
    default: 0,
    min: 0
  },
  country: {
    type: String,
    maxlength: [50, 'Country name cannot be more than 50 characters']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  socialLinks: {
    github: {
      type: String,
      match: [/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/, 'Please provide a valid GitHub URL']
    },
    linkedin: {
      type: String,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/, 'Please provide a valid LinkedIn URL']
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid website URL']
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      enum: ['javascript', 'python', 'cpp', 'java', 'c'],
      default: 'python'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      contests: {
        type: Boolean,
        default: true
      },
      discussions: {
        type: Boolean,
        default: true
      }
    }
  },
  achievements: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ rating: -1 });
userSchema.index({ problemsSolved: -1 });
userSchema.index({ rank: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for solved problems percentage
userSchema.virtual('solvedPercentage').get(function() {
  if (this.submissions === 0) return 0;
  return Math.round((this.problemsSolved / this.submissions) * 100);
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update stats after problem solved
userSchema.methods.updateProblemStats = function() {
  this.problemsSolved += 1;
  this.submissions += 1;
  this.acceptanceRate = Math.round((this.problemsSolved / this.submissions) * 100);
  
  // Update streak
  const today = new Date().toDateString();
  const lastSolved = this.lastSolvedDate ? this.lastSolvedDate.toDateString() : null;
  
  if (lastSolved === today) {
    // Already solved today, don't update streak
    return;
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (lastSolved === yesterday.toDateString()) {
    // Solved yesterday, continue streak
    this.currentStreak += 1;
  } else {
    // Streak broken or first solve
    this.currentStreak = 1;
  }
  
  // Update longest streak
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  this.lastSolvedDate = new Date();
  this.lastActiveAt = new Date();
};

// Method to update submission stats
userSchema.methods.updateSubmissionStats = function() {
  this.submissions += 1;
  this.acceptanceRate = Math.round((this.problemsSolved / this.submissions) * 100);
  this.lastActiveAt = new Date();
};

// Method to add achievement
userSchema.methods.addAchievement = function(name, description, icon) {
  // Check if achievement already exists
  const existingAchievement = this.achievements.find(ach => ach.name === name);
  if (!existingAchievement) {
    this.achievements.push({
      name,
      description,
      icon,
      earnedAt: new Date()
    });
  }
};

// Static method to get leaderboard
userSchema.statics.getLeaderboard = function(limit = 50, sortBy = 'rating') {
  const sortOptions = {
    rating: { rating: -1, problemsSolved: -1 },
    problemsSolved: { problemsSolved: -1, rating: -1 },
    acceptanceRate: { acceptanceRate: -1, problemsSolved: -1 }
  };
  
  return this.find({ isActive: true })
    .select('-password -emailVerificationToken -passwordResetToken')
    .sort(sortOptions[sortBy] || sortOptions.rating)
    .limit(limit);
};

// Static method to get user rank
userSchema.statics.getUserRank = async function(userId, sortBy = 'rating') {
  const user = await this.findById(userId);
  if (!user) return null;
  
  let rankQuery;
  switch (sortBy) {
    case 'problemsSolved':
      rankQuery = {
        $or: [
          { problemsSolved: { $gt: user.problemsSolved } },
          { 
            problemsSolved: user.problemsSolved, 
            rating: { $gt: user.rating } 
          }
        ]
      };
      break;
    case 'acceptanceRate':
      rankQuery = {
        $or: [
          { acceptanceRate: { $gt: user.acceptanceRate } },
          { 
            acceptanceRate: user.acceptanceRate, 
            problemsSolved: { $gt: user.problemsSolved } 
          }
        ]
      };
      break;
    default: // rating
      rankQuery = {
        $or: [
          { rating: { $gt: user.rating } },
          { 
            rating: user.rating, 
            problemsSolved: { $gt: user.problemsSolved } 
          }
        ]
      };
  }
  
  const rank = await this.countDocuments({
    ...rankQuery,
    isActive: true
  });
  
  return rank + 1;
};

module.exports = mongoose.model('User', userSchema);
