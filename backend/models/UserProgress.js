const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Experience Points System
  totalXP: {
    type: Number,
    default: 0,
    index: true
  },
  level: {
    type: Number,
    default: 1,
    index: true
  },
  currentLevelXP: {
    type: Number,
    default: 0
  },
  xpToNextLevel: {
    type: Number,
    default: 100
  },
  
  // Problem Solving Statistics
  problemsStats: {
    totalSolved: {
      type: Number,
      default: 0
    },
    easySolved: {
      type: Number,
      default: 0
    },
    mediumSolved: {
      type: Number,
      default: 0
    },
    hardSolved: {
      type: Number,
      default: 0
    },
    totalAttempted: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    }
  },
  
  // Submission Statistics
  submissionStats: {
    totalSubmissions: {
      type: Number,
      default: 0
    },
    acceptedSubmissions: {
      type: Number,
      default: 0
    },
    acceptanceRate: {
      type: Number,
      default: 0
    },
    averageExecutionTime: {
      type: Number,
      default: 0
    },
    fastestSolution: {
      problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
      },
      executionTime: Number,
      submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission'
      }
    }
  },
  
  // Language Proficiency
  languageStats: [{
    language: {
      type: String,
      required: true
    },
    problemsSolved: {
      type: Number,
      default: 0
    },
    submissions: {
      type: Number,
      default: 0
    },
    acceptanceRate: {
      type: Number,
      default: 0
    }
  }],
    // Badges and Achievements
  badges: [{
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
      required: true,
      index: true
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 100 // Percentage of completion when earned
    }
  }],
  
  // Activity Tracking
  activity: {
    currentStreak: {
      type: Number,
      default: 0,
      index: true
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActiveDate: {
      type: Date
    },
    activeDays: [{
      date: {
        type: Date,
        required: true
      },
      problemsSolved: {
        type: Number,
        default: 0
      },
      submissions: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // Contest Performance
  contestStats: {
    participatedContests: {
      type: Number,
      default: 0
    },
    bestRank: {
      type: Number
    },
    averageRank: {
      type: Number
    },    rating: {
      type: Number,
      default: 1500,
      index: true
    },
    maxRating: {
      type: Number,
      default: 1500
    },
    ratingHistory: [{
      contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest'
      },
      oldRating: Number,
      newRating: Number,
      rank: Number,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Skills and Topics
  topicProgress: [{
    topic: {
      type: String,
      required: true
    },
    problemsSolved: {
      type: Number,
      default: 0
    },
    difficulty: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 }
    },
    proficiencyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    }
  }]
}, {
  timestamps: true
});

// Calculate XP needed for next level (exponential growth)
userProgressSchema.methods.calculateXPForLevel = function(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Add XP and update level
userProgressSchema.methods.addXP = function(xpGained) {
  this.totalXP += xpGained;
  this.currentLevelXP += xpGained;
  
  // Check for level up
  while (this.currentLevelXP >= this.xpToNextLevel) {
    this.currentLevelXP -= this.xpToNextLevel;
    this.level += 1;
    this.xpToNextLevel = this.calculateXPForLevel(this.level + 1);
  }
  
  return this.save();
};

// Update problem solving statistics
userProgressSchema.methods.updateProblemStats = function(difficulty, isNewSolve = false) {
  if (isNewSolve) {
    this.problemsStats.totalSolved += 1;
    
    switch(difficulty.toLowerCase()) {
      case 'easy':
        this.problemsStats.easySolved += 1;
        break;
      case 'medium':
        this.problemsStats.mediumSolved += 1;
        break;
      case 'hard':
        this.problemsStats.hardSolved += 1;
        break;
    }
  }
  
  this.problemsStats.totalAttempted += 1;
  this.problemsStats.successRate = this.problemsStats.totalAttempted > 0 ? 
    Math.round((this.problemsStats.totalSolved / this.problemsStats.totalAttempted) * 100) : 0;
    
  return this.save();
};

// Update activity streak
userProgressSchema.methods.updateActivity = function(date = new Date()) {
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const lastActive = this.activity.lastActiveDate ? 
    new Date(this.activity.lastActiveDate.getFullYear(), this.activity.lastActiveDate.getMonth(), this.activity.lastActiveDate.getDate()) : 
    null;
  
  if (!lastActive || today.getTime() !== lastActive.getTime()) {
    // It's a new day
    if (lastActive && (today.getTime() - lastActive.getTime()) === 86400000) {
      // Consecutive day
      this.activity.currentStreak += 1;
    } else {
      // Streak broken or first day
      this.activity.currentStreak = 1;
    }
    
    this.activity.longestStreak = Math.max(this.activity.longestStreak, this.activity.currentStreak);
    this.activity.lastActiveDate = today;
    
    // Add to active days
    const existingDay = this.activity.activeDays.find(day => 
      day.date.getTime() === today.getTime()
    );
    
    if (!existingDay) {
      this.activity.activeDays.push({
        date: today,
        problemsSolved: 0,
        submissions: 1
      });
    }
  }
  
  return this.save();
};

// Static method to get leaderboard by XP
userProgressSchema.statics.getXPLeaderboard = function(limit = 50) {
  return this.find()
    .sort({ totalXP: -1 })
    .limit(limit)
    .populate('userId', 'name email avatar');
};

// Static method to get leaderboard by contest rating
userProgressSchema.statics.getRatingLeaderboard = function(limit = 50) {
  return this.find()
    .sort({ 'contestStats.rating': -1 })
    .limit(limit)
    .populate('userId', 'name email avatar');
};

module.exports = mongoose.model('UserProgress', userProgressSchema);
