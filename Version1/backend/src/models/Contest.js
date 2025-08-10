const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Contest name is required'],
    trim: true,
    maxlength: [200, 'Contest name cannot be more than 200 characters']
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
    required: [true, 'Contest description is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Contest type is required'],
    enum: ['Rated', 'Unrated', 'Educational', 'Div1', 'Div2', 'Div3', 'Global'],
    default: 'Rated'
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Running', 'Finished', 'Cancelled'],
    default: 'Upcoming'
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [30, 'Contest duration must be at least 30 minutes'],
    max: [600, 'Contest duration cannot exceed 600 minutes (10 hours)']
  },
  registrationStartTime: {
    type: Date,
    required: [true, 'Registration start time is required']
  },
  registrationEndTime: {
    type: Date,
    required: [true, 'Registration end time is required']
  },
  problems: [{
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true
    },
    order: {
      type: Number,
      required: true,
      min: 1
    },
    points: {
      type: Number,
      required: true,
      min: 0
    },
    penalty: {
      type: Number,
      default: 20, // penalty in minutes for wrong submission
      min: 0
    }
  }],
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    rating: {
      type: Number,
      default: 1200
    },
    participated: {
      type: Boolean,
      default: false
    },
    rank: {
      type: Number
    },
    score: {
      type: Number,
      default: 0
    },
    penalty: {
      type: Number,
      default: 0
    },
    problemsSolved: {
      type: Number,
      default: 0
    },
    lastSubmissionTime: {
      type: Date
    }
  }],
  maxParticipants: {
    type: Number,
    min: 1
  },
  rules: {
    type: String,
    default: `
    1. The contest will run for the specified duration.
    2. Participants can submit solutions in multiple programming languages.
    3. Each problem has a specific point value.
    4. Wrong submissions will incur a time penalty.
    5. Plagiarism will result in disqualification.
    6. The decision of the judges is final.
    `
  },
  prizes: [{
    rank: {
      type: Number,
      required: true,
      min: 1
    },
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      min: 0
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isRated: {
    type: Boolean,
    default: true
  },
  ratingChanges: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    oldRating: {
      type: Number,
      required: true
    },
    newRating: {
      type: Number,
      required: true
    },
    change: {
      type: Number,
      required: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  announcements: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isImportant: {
      type: Boolean,
      default: false
    }
  }],
  clarifications: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      trim: true
    },
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    askedAt: {
      type: Date,
      default: Date.now
    },
    answeredAt: {
      type: Date
    },
    isAnswered: {
      type: Boolean,
      default: false
    },
    isPublic: {
      type: Boolean,
      default: false
    }
  }],
  submissionFreeze: {
    enabled: {
      type: Boolean,
      default: false
    },
    freezeTime: {
      type: Number, // minutes before end
      default: 60
    }
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  editorialAvailable: {
    type: Boolean,
    default: false
  },
  editorialUrl: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
contestSchema.index({ status: 1 });
contestSchema.index({ startTime: 1 });
contestSchema.index({ endTime: 1 });
contestSchema.index({ type: 1 });
contestSchema.index({ isPublic: 1, isVisible: 1 });
contestSchema.index({ 'participants.user': 1 });
contestSchema.index({ createdAt: -1 });

// Virtual for current status based on time
contestSchema.virtual('currentStatus').get(function() {
  const now = new Date();
  
  if (this.status === 'Cancelled') return 'Cancelled';
  
  if (now < this.startTime) return 'Upcoming';
  if (now >= this.startTime && now <= this.endTime) return 'Running';
  if (now > this.endTime) return 'Finished';
  
  return this.status;
});

// Virtual for registration status
contestSchema.virtual('registrationStatus').get(function() {
  const now = new Date();
  
  if (now < this.registrationStartTime) return 'Not Started';
  if (now >= this.registrationStartTime && now <= this.registrationEndTime) return 'Open';
  if (now > this.registrationEndTime) return 'Closed';
  
  return 'Closed';
});

// Virtual for time remaining
contestSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const currentStatus = this.currentStatus;
  
  if (currentStatus === 'Upcoming') {
    return Math.max(0, this.startTime.getTime() - now.getTime());
  } else if (currentStatus === 'Running') {
    return Math.max(0, this.endTime.getTime() - now.getTime());
  }
  
  return 0;
});

// Virtual for participant count
contestSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Virtual for actual participant count (who submitted at least once)
contestSchema.virtual('actualParticipantCount').get(function() {
  return this.participants.filter(p => p.participated).length;
});

// Virtual for formatted duration
contestSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
});

// Pre-save middleware to generate slug
contestSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Pre-save middleware to validate times
contestSchema.pre('save', function(next) {
  // Validate that end time is after start time
  if (this.endTime <= this.startTime) {
    return next(new Error('End time must be after start time'));
  }
  
  // Validate that registration end time is before or equal to start time
  if (this.registrationEndTime > this.startTime) {
    return next(new Error('Registration must end before or when contest starts'));
  }
  
  // Validate that registration start time is before registration end time
  if (this.registrationStartTime >= this.registrationEndTime) {
    return next(new Error('Registration start time must be before registration end time'));
  }
  
  // Calculate duration in minutes
  const durationMs = this.endTime.getTime() - this.startTime.getTime();
  const durationMinutes = Math.round(durationMs / (1000 * 60));
  
  if (Math.abs(this.duration - durationMinutes) > 1) {
    this.duration = durationMinutes;
  }
  
  next();
});

// Method to register a user
contestSchema.methods.registerUser = function(userId, userRating = 1200) {
  // Check if registration is open
  const now = new Date();
  if (now < this.registrationStartTime || now > this.registrationEndTime) {
    throw new Error('Registration is not open');
  }
  
  // Check if user is already registered
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  if (existingParticipant) {
    throw new Error('User is already registered');
  }
  
  // Check participant limit
  if (this.maxParticipants && this.participants.length >= this.maxParticipants) {
    throw new Error('Contest is full');
  }
  
  this.participants.push({
    user: userId,
    registeredAt: new Date(),
    rating: userRating
  });
};

// Method to unregister a user
contestSchema.methods.unregisterUser = function(userId) {
  const participantIndex = this.participants.findIndex(p => p.user.toString() === userId.toString());
  if (participantIndex === -1) {
    throw new Error('User is not registered');
  }
  
  // Check if contest has started
  const now = new Date();
  if (now >= this.startTime) {
    throw new Error('Cannot unregister after contest has started');
  }
  
  this.participants.splice(participantIndex, 1);
};

// Method to update participant stats
contestSchema.methods.updateParticipantStats = function(userId, submissionData) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant) {
    throw new Error('User is not registered for this contest');
  }
  
  participant.participated = true;
  participant.lastSubmissionTime = new Date();
  
  // Update stats based on submission data
  if (submissionData.isAccepted && submissionData.isFirstAccepted) {
    participant.problemsSolved += 1;
    participant.score += submissionData.points;
  }
  
  // Add penalty for wrong submissions
  if (!submissionData.isAccepted) {
    participant.penalty += submissionData.penalty || 0;
  }
};

// Method to calculate and update rankings
contestSchema.methods.updateRankings = function() {
  // Sort participants by score (desc), then by penalty (asc), then by last submission time (asc)
  this.participants.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.penalty !== b.penalty) return a.penalty - b.penalty;
    
    const aTime = a.lastSubmissionTime || new Date(0);
    const bTime = b.lastSubmissionTime || new Date(0);
    return aTime.getTime() - bTime.getTime();
  });
  
  // Assign ranks
  let currentRank = 1;
  for (let i = 0; i < this.participants.length; i++) {
    if (this.participants[i].participated) {
      if (i > 0) {
        const prev = this.participants[i - 1];
        const curr = this.participants[i];
        
        // Same rank if same score and penalty
        if (prev.score === curr.score && prev.penalty === curr.penalty) {
          this.participants[i].rank = prev.rank;
        } else {
          currentRank = i + 1;
          this.participants[i].rank = currentRank;
        }
      } else {
        this.participants[i].rank = currentRank;
      }
    }
  }
};

// Method to add announcement
contestSchema.methods.addAnnouncement = function(title, content, createdBy, isImportant = false) {
  this.announcements.push({
    title,
    content,
    createdBy,
    isImportant,
    createdAt: new Date()
  });
};

// Method to add clarification
contestSchema.methods.addClarification = function(question, askedBy) {
  this.clarifications.push({
    question,
    askedBy,
    askedAt: new Date()
  });
};

// Method to answer clarification
contestSchema.methods.answerClarification = function(clarificationId, answer, answeredBy, isPublic = false) {
  const clarification = this.clarifications.id(clarificationId);
  if (!clarification) {
    throw new Error('Clarification not found');
  }
  
  clarification.answer = answer;
  clarification.answeredBy = answeredBy;
  clarification.answeredAt = new Date();
  clarification.isAnswered = true;
  clarification.isPublic = isPublic;
};

// Static method to get upcoming contests
contestSchema.statics.getUpcomingContests = function(limit = 10) {
  const now = new Date();
  return this.find({
    startTime: { $gt: now },
    isVisible: true,
    isPublic: true
  })
    .populate('createdBy', 'name avatar')
    .populate('problems.problem', 'title difficulty')
    .sort({ startTime: 1 })
    .limit(limit);
};

// Static method to get running contests
contestSchema.statics.getRunningContests = function() {
  const now = new Date();
  return this.find({
    startTime: { $lte: now },
    endTime: { $gt: now },
    isVisible: true,
    isPublic: true
  })
    .populate('createdBy', 'name avatar')
    .populate('problems.problem', 'title difficulty')
    .sort({ startTime: 1 });
};

// Static method to get finished contests
contestSchema.statics.getFinishedContests = function(limit = 20) {
  const now = new Date();
  return this.find({
    endTime: { $lt: now },
    isVisible: true,
    isPublic: true
  })
    .populate('createdBy', 'name avatar')
    .populate('problems.problem', 'title difficulty')
    .sort({ endTime: -1 })
    .limit(limit);
};

// Static method to get contest standings
contestSchema.statics.getStandings = function(contestId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.findById(contestId)
    .populate({
      path: 'participants.user',
      select: 'name avatar country'
    })
    .then(contest => {
      if (!contest) return null;
      
      // Filter only participated users and sort by rank
      const standings = contest.participants
        .filter(p => p.participated && p.rank)
        .sort((a, b) => a.rank - b.rank)
        .slice(skip, skip + limit);
      
      return {
        contest: {
          name: contest.name,
          type: contest.type,
          currentStatus: contest.currentStatus
        },
        standings,
        totalParticipants: contest.actualParticipantCount
      };
    });
};

module.exports = mongoose.model('Contest', contestSchema);
