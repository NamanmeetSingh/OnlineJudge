const Joi = require('joi');

const codeExecutionSchema = Joi.object({
  code: Joi.string().required().max(50000),
  language: Joi.string().valid('javascript', 'python', 'java', 'cpp', 'c').required(),
  input: Joi.string().allow('').max(10000),
  timeLimit: Joi.number().integer().min(1).max(30).default(10)
});

const submissionSchema = Joi.object({
  code: Joi.string().required().max(50000),
  language: Joi.string().valid('javascript', 'python', 'java', 'cpp', 'c').required(),
  problemId: Joi.string().required(),
  testCases: Joi.array().items(
    Joi.object({
      input: Joi.string().required(),
      expectedOutput: Joi.string().required()
    })
  ).min(1).required(),
  timeLimit: Joi.number().integer().min(1).max(30).default(10)
});

const validateSubmission = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.body = value;
    next();
  };
};

module.exports = {
  validateSubmission,
  codeExecutionSchema,
  submissionSchema
};
