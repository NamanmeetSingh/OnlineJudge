const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Common validation rules
const validationRules = {
  // User validation rules
  user: {
    register: [
      body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
      
      body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
      
      body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
    ],
    
    login: [
      body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
      
      body('password')
        .notEmpty()
        .withMessage('Password is required')
    ],
    
    updateProfile: [
      body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
      
      body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio cannot exceed 500 characters'),
      
      body('country')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Country name cannot exceed 50 characters'),
      
      body('socialLinks.github')
        .optional()
        .isURL()
        .withMessage('Please provide a valid GitHub URL'),
      
      body('socialLinks.linkedin')
        .optional()
        .isURL()
        .withMessage('Please provide a valid LinkedIn URL'),
      
      body('socialLinks.website')
        .optional()
        .isURL()
        .withMessage('Please provide a valid website URL')
    ],
    
    changePassword: [
      body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
      
      body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
    ]
  },
  
  // Problem validation rules
  problem: {
    create: [
      body('title')
        .trim()
        .notEmpty()
        .withMessage('Problem title is required')
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
      
      body('description')
        .trim()
        .notEmpty()
        .withMessage('Problem description is required'),
      
      body('difficulty')
        .isIn(['Easy', 'Medium', 'Hard'])
        .withMessage('Difficulty must be Easy, Medium, or Hard'),
      
      body('category')
        .notEmpty()
        .withMessage('Category is required'),
      
      body('constraints')
        .trim()
        .notEmpty()
        .withMessage('Constraints are required'),
      
      body('examples')
        .isArray({ min: 1 })
        .withMessage('At least one example is required'),
      
      body('testCases')
        .isArray({ min: 1 })
        .withMessage('At least one test case is required'),
      
      body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array')
    ],
    
    update: [
      body('title')
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
      
      body('difficulty')
        .optional()
        .isIn(['Easy', 'Medium', 'Hard'])
        .withMessage('Difficulty must be Easy, Medium, or Hard'),
      
      body('examples')
        .optional()
        .isArray({ min: 1 })
        .withMessage('At least one example is required'),
      
      body('testCases')
        .optional()
        .isArray({ min: 1 })
        .withMessage('At least one test case is required')
    ]
  },
  
  // Submission validation rules
  submission: {
    create: [
      body('code')
        .trim()
        .notEmpty()
        .withMessage('Code is required')
        .isLength({ min: 1, max: 50000 })
        .withMessage('Code must be between 1 and 50000 characters'),
      
      body('language')
        .isIn(['javascript', 'python', 'cpp', 'java', 'c'])
        .withMessage('Language must be one of: javascript, python, cpp, java, c'),
      
      body('problemId')
        .notEmpty()
        .withMessage('Problem ID is required')
        .isMongoId()
        .withMessage('Invalid problem ID')
    ]
  },
  
  // Contest validation rules
  contest: {
    create: [
      body('name')
        .trim()
        .notEmpty()
        .withMessage('Contest name is required')
        .isLength({ min: 5, max: 200 })
        .withMessage('Contest name must be between 5 and 200 characters'),
      
      body('description')
        .trim()
        .notEmpty()
        .withMessage('Contest description is required'),
      
      body('type')
        .isIn(['Rated', 'Unrated', 'Educational', 'Div1', 'Div2', 'Div3', 'Global'])
        .withMessage('Invalid contest type'),
      
      body('startTime')
        .isISO8601()
        .withMessage('Start time must be a valid date'),
      
      body('endTime')
        .isISO8601()
        .withMessage('End time must be a valid date'),
      
      body('duration')
        .isInt({ min: 30, max: 600 })
        .withMessage('Duration must be between 30 and 600 minutes'),
      
      body('registrationStartTime')
        .isISO8601()
        .withMessage('Registration start time must be a valid date'),
      
      body('registrationEndTime')
        .isISO8601()
        .withMessage('Registration end time must be a valid date'),
      
      body('problems')
        .isArray({ min: 1 })
        .withMessage('At least one problem is required')
    ],
    
    register: [
      param('id')
        .isMongoId()
        .withMessage('Invalid contest ID')
    ]
  },
  
  // Discussion validation rules
  discussion: {
    create: [
      body('title')
        .trim()
        .notEmpty()
        .withMessage('Discussion title is required')
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
      
      body('content')
        .trim()
        .notEmpty()
        .withMessage('Discussion content is required')
        .isLength({ min: 10 })
        .withMessage('Content must be at least 10 characters long'),
      
      body('category')
        .isIn(['General', 'Problems', 'Contests', 'Announcements', 'Help', 'Tutorials', 'Off-Topic'])
        .withMessage('Invalid category'),
      
      body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
      
      body('problemId')
        .optional()
        .isMongoId()
        .withMessage('Invalid problem ID'),
      
      body('contestId')
        .optional()
        .isMongoId()
        .withMessage('Invalid contest ID')
    ],
    
    reply: [
      body('content')
        .trim()
        .notEmpty()
        .withMessage('Reply content is required')
        .isLength({ min: 1 })
        .withMessage('Reply content cannot be empty'),
      
      param('id')
        .isMongoId()
        .withMessage('Invalid discussion ID')
    ]
  },
  
  // Common parameter validations
  params: {
    mongoId: [
      param('id')
        .isMongoId()
        .withMessage('Invalid ID format')
    ],
    
    slug: [
      param('slug')
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Invalid slug format')
    ]
  },
  
  // Query parameter validations
  query: {
    pagination: [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
    ],
    
    sorting: [
      query('sortBy')
        .optional()
        .isString()
        .withMessage('Sort by must be a string'),
      
      query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc')
    ]
  }
};

// Helper function to combine validation rules
const combineValidations = (...validations) => {
  return [].concat(...validations, handleValidationErrors);
};

module.exports = {
  handleValidationErrors,
  validationRules,
  combineValidations
};
