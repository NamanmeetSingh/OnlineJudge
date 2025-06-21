const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String, // URL or icon class name
    required: true
  },
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },  category: {
    type: String,
    enum: [
      'problem_solving',
      'streak',
      'language',
      'speed',
      'participation',
      'achievement',
      'special'
    ],
    required: true,
    index: true
  },
  rarity: {
    type: String,
    enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'],
    default: 'Common',
    index: true
  },
  criteria: {
    type: {
      type: String,
      enum: [
        'problems_solved',
        'consecutive_days',
        'specific_language',
        'contest_participation',
        'fast_solution',
        'first_solution',
        'difficulty_milestone',
        'custom'
      ],
      required: true
    },
    value: {
      type: Number, // The threshold value for earning the badge
      required: true
    },
    metadata: {
      language: String, // For language-specific badges
      difficulty: String, // For difficulty-specific badges
      timeLimit: Number, // For speed-based badges (in milliseconds)
      customCondition: String // For custom badge logic
    }
  },
  xpReward: {
    type: Number,
    default: 10
  },  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isHidden: {
    type: Boolean,
    default: false // Hidden badges are surprise achievements
  }
}, {
  timestamps: true
});

// Static method to get badges by category
badgeSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ rarity: 1, name: 1 });
};

// Static method to get visible badges
badgeSchema.statics.getVisible = function() {
  return this.find({ isActive: true, isHidden: false }).sort({ category: 1, name: 1 });
};

module.exports = mongoose.model('Badge', badgeSchema);
