const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  type: {
    type: String,
    enum: ['Individual', 'Team'],
    default: 'Individual'
  },
  format: {
    type: String,
    enum: ['ICPC', 'IOI', 'Custom'],
    default: 'Custom'
  },  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // Duration in minutes
    required: true
  },  problems: [{
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true
    },
    points: {
      type: Number,
      default: 100
    },
    order: {
      type: Number,
      required: true
    }
  }],  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    registrationTime: {
      type: Date,
      default: Date.now
    },
    isDisqualified: {
      type: Boolean,
      default: false
    }
  }],
  maxParticipants: {
    type: Number,
    default: null // null means unlimited
  },
  isRated: {
    type: Boolean,
    default: true
  },  visibility: {
    type: String,
    enum: ['Public', 'Private', 'Invite-Only'],
    default: 'Public',
    index: true
  },
  registrationRequired: {
    type: Boolean,
    default: true
  },
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  penaltyPerWrongSubmission: {
    type: Number,
    default: 20 // Penalty in minutes for ICPC style
  },
  rules: {
    type: String
  },
  prizes: [{
    position: Number,
    description: String,
    value: String
  }],  status: {
    type: String,
    enum: ['Draft', 'Upcoming', 'Running', 'Ended', 'Cancelled'],
    default: 'Draft',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Virtual for contest URL
contestSchema.virtual('url').get(function() {
  return `/contests/${this.slug}`;
});

// Virtual to check if contest is active
contestSchema.virtual('isActive').get(function() {
  const now = new Date();
  return now >= this.startTime && now <= this.endTime;
});

// Virtual to check if registration is open
contestSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  return this.registrationRequired && 
         now < this.startTime && 
         this.status === 'Upcoming' &&
         (this.maxParticipants === null || this.participants.length < this.maxParticipants);
});

// Pre-save hook to update status based on time
contestSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.status === 'Draft') {
    // Don't auto-update draft contests
    return next();
  }
  
  if (now < this.startTime) {
    this.status = 'Upcoming';
  } else if (now >= this.startTime && now <= this.endTime) {
    this.status = 'Running';
  } else if (now > this.endTime) {
    this.status = 'Ended';
  }
  
  next();
});

// Static method to get upcoming contests
contestSchema.statics.getUpcoming = function(limit = 10) {
  return this.find({ 
    status: { $in: ['Upcoming', 'Running'] },
    visibility: 'Public'
  })
  .sort({ startTime: 1 })
  .limit(limit);
};

// Static method to get contests by user participation
contestSchema.statics.getUserContests = function(userId) {
  return this.find({ 'participants.userId': userId })
    .sort({ startTime: -1 });
};

// Instance method to add participant
contestSchema.methods.addParticipant = function(userId) {
  if (!this.participants.some(p => p.userId.equals(userId))) {
    this.participants.push({ userId });
  }
  return this.save();
};

// Instance method to remove participant
contestSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => !p.userId.equals(userId));
  return this.save();
};

module.exports = mongoose.model('Contest', contestSchema);
