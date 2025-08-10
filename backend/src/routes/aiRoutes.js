const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticateToken } = require('../middleware/auth');
const { validationResult, body } = require('express-validator');
const GeminiService = require('../services/GeminiService');

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiService = new GeminiService();

// Validation middleware
const aiAssistValidation = [
  body('code').notEmpty().withMessage('Code is required'),
  body('language').notEmpty().withMessage('Language is required'),
  body('problem').optional().isObject(),
  body('question').optional().isString()
];

// Get AI service status
router.get('/status', async (req, res) => {
  try {
    const status = geminiService.getServiceStatus();
    
    res.json({
      success: true,
      data: {
        service: 'Gemini AI',
        status: status.status,
        apiKey: status.apiKey,
        rateLimit: status.rateLimit,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check AI service status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get AI code assistance
router.post('/assist', authenticateToken, aiAssistValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { code, language, problem, question } = req.body;

    // Create a comprehensive prompt for Gemini
    let prompt = `You are an expert programming assistant helping with coding problems. Please analyze the following:

**Problem Context:**`;

    if (problem) {
      prompt += `
- **Title:** ${problem.title || 'Unknown Problem'}
- **Difficulty:** ${problem.difficulty || 'Unknown'}
- **Description:** ${problem.description || 'No description provided'}`;

      if (problem.examples && problem.examples.length > 0) {
        prompt += `
- **Examples:**`;
        problem.examples.forEach((example, idx) => {
          prompt += `
  Example ${idx + 1}:
  Input: ${example.input}
  Output: ${example.output}`;
          if (example.explanation) {
            prompt += `
  Explanation: ${example.explanation}`;
          }
        });
      }

      if (problem.constraints) {
        prompt += `
- **Constraints:** ${problem.constraints}`;
      }
    }

    prompt += `

**Current Code (${language}):**
\`\`\`${language}
${code}
\`\`\``;

    if (question) {
      prompt += `

**Specific Question:** ${question}`;
    }

    prompt += `

Please provide a helpful analysis that includes:
1. **Code Review:** What's working well and what could be improved
2. **Potential Issues:** Any bugs, edge cases, or logical errors
3. **Optimization Suggestions:** Ways to improve time/space complexity
4. **Algorithm Explanation:** Brief explanation of the approach
5. **Next Steps:** Specific recommendations for improvement

Please be constructive and educational in your response. If the code has issues, explain why and suggest fixes. If it's working well, suggest optimizations or alternative approaches.`;

    // Get response from Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    res.json({
      success: true,
      data: {
        analysis: aiResponse,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI assistance error:', error);
    
    let errorMessage = 'AI service temporarily unavailable';
    if (error.message && error.message.includes('API key')) {
      errorMessage = 'AI service configuration error';
    } else if (error.message && error.message.includes('quota')) {
      errorMessage = 'AI service quota exceeded';
    } else if (error.message && error.message.includes('Rate limit')) {
      errorMessage = 'Rate limit exceeded. Please try again in a minute.';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get code suggestions
router.post('/suggest', authenticateToken, aiAssistValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { code, language, problem } = req.body;

    let prompt = `You are a coding mentor. Given this problem and partial code, provide specific code suggestions:

**Problem:** ${problem?.title || 'Coding Problem'}
**Language:** ${language}

**Current Code:**
\`\`\`${language}
${code}
\`\`\``;

    if (problem?.description) {
      prompt += `

**Description:** ${problem.description}`;
    }

    prompt += `

Please provide:
1. **Immediate next steps** - What should the developer write next?
2. **Code snippets** - Specific code examples they can use
3. **Algorithm hints** - High-level approach suggestions
4. **Common pitfalls** - What to avoid

Keep suggestions practical and actionable. Format code snippets clearly.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestions = response.text();

    res.json({
      success: true,
      data: {
        suggestions,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Explain code functionality
router.post('/explain', authenticateToken, [
  body('code').notEmpty().withMessage('Code is required'),
  body('language').notEmpty().withMessage('Language is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { code, language } = req.body;

    const prompt = `Please explain this ${language} code in a clear and educational way:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. **Overall Purpose:** What does this code do?
2. **Step-by-step breakdown:** Explain each major section
3. **Time & Space Complexity:** If applicable
4. **Key concepts used:** Data structures, algorithms, etc.

Keep the explanation beginner-friendly but technically accurate.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const explanation = response.text();

    res.json({
      success: true,
      data: {
        explanation,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI explanation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get code explanation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
