const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Rate limiting
    this.requestCount = 0;
    this.lastResetTime = Date.now();
    this.maxRequestsPerMinute = 60; // Adjust based on your Gemini API quota
  }

  // Rate limiting check
  checkRateLimit() {
    const now = Date.now();
    if (now - this.lastResetTime >= 60000) { // Reset every minute
      this.requestCount = 0;
      this.lastResetTime = now;
    }
    
    if (this.requestCount >= this.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded. Please try again in a minute.');
    }
    
    this.requestCount++;
  }

  async executeCode(code, language, testCases = []) {
    try {
      this.checkRateLimit();
      
      const prompt = this.buildExecutionPrompt(code, language, testCases);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseGeminiResponse(text, testCases);
    } catch (error) {
      console.error('Gemini API error:', error);
      
      if (error.message.includes('Rate limit')) {
        throw error;
      } else if (error.message.includes('API key')) {
        throw new Error('AI service configuration error. Please contact support.');
      } else if (error.message.includes('quota')) {
        throw new Error('AI service quota exceeded. Please try again later.');
      } else {
        throw new Error(`Code execution failed: ${error.message}`);
      }
    }
  }

  buildExecutionPrompt(code, language, testCases) {
    const languageInfo = this.getLanguageInfo(language);
    
    let prompt = `You are a code execution assistant. Execute the following ${languageInfo.name} code and test it against the provided test cases.

Code to execute:
\`\`\`${languageInfo.extension}
${code}
\`\`\`

Test Cases:
${testCases.map((tc, index) => `Test Case ${index + 1}:
Input: ${tc.input}
Expected Output: ${tc.expectedOutput}`).join('\n\n')}

Instructions:
1. Execute the code with each test case input
2. Compare the actual output with expected output
3. Return results in the following JSON format:
{
  "overallPassed": boolean,
  "passedCount": number,
  "totalCount": number,
  "results": [
    {
      "testCaseNumber": number,
      "input": string,
      "expectedOutput": string,
      "actualOutput": string,
      "passed": boolean,
      "status": "success" | "error",
      "error": string (if any),
      "executionTime": number (in milliseconds),
      "memoryUsed": number (in KB)
    }
  ]
}

Important:
- Only return valid JSON, no additional text
- If there's a compilation error, set status to "error" and provide the error message
- If there's a runtime error, set status to "error" and provide the error message
- For successful execution, set status to "success"
- Estimate execution time and memory usage realistically
- Ensure the JSON is properly formatted and parseable
- Handle edge cases and invalid inputs gracefully`;

    return prompt;
  }

  getLanguageInfo(language) {
    const languageMap = {
      'python': { name: 'Python', extension: 'python' },
      'javascript': { name: 'JavaScript', extension: 'javascript' },
      'java': { name: 'Java', extension: 'java' },
      'cpp': { name: 'C++', extension: 'cpp' },
      'c': { name: 'C', extension: 'c' }
    };
    
    return languageMap[language] || { name: 'Unknown', extension: 'text' };
  }

  parseGeminiResponse(response, testCases) {
    try {
      // Extract JSON from the response (remove any markdown formatting)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini API');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate the response structure
      if (!parsed.results || !Array.isArray(parsed.results)) {
        throw new Error('Invalid response structure from Gemini API');
      }

      // Ensure all test cases are covered
      if (parsed.results.length !== testCases.length) {
        throw new Error('Response does not cover all test cases');
      }

      // Validate each result
      parsed.results.forEach((result, index) => {
        if (!result.hasOwnProperty('passed') || 
            !result.hasOwnProperty('status') || 
            !result.hasOwnProperty('actualOutput')) {
          throw new Error(`Invalid result structure for test case ${index + 1}`);
        }
      });

      return parsed;
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      console.error('Raw response:', response);
      
      // Return a fallback response
      return {
        overallPassed: false,
        passedCount: 0,
        totalCount: testCases.length,
        results: testCases.map((tc, index) => ({
          testCaseNumber: index + 1,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: '',
          passed: false,
          status: 'error',
          error: 'Failed to parse Gemini API response',
          executionTime: 0,
          memoryUsed: 0
        }))
      };
    }
  }

  async executeFunctionCode(code, language, testCases, functionSignature) {
    try {
      this.checkRateLimit();
      
      const prompt = this.buildFunctionExecutionPrompt(code, language, testCases, functionSignature);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseGeminiResponse(text, testCases);
    } catch (error) {
      console.error('Gemini API function execution error:', error);
      
      if (error.message.includes('Rate limit')) {
        throw error;
      } else {
        throw new Error(`Function execution failed: ${error.message}`);
      }
    }
  }

  buildFunctionExecutionPrompt(code, language, testCases, functionSignature) {
    const languageInfo = this.getLanguageInfo(language);
    const signature = functionSignature[language];
    
    if (!signature) {
      throw new Error(`Function signature not available for ${language}`);
    }
    
    let prompt = `You are a code execution assistant. Execute the following ${languageInfo.name} code that contains a function/class solution and test it against the provided test cases.

IMPORTANT FUNCTION SIGNATURE REQUIREMENTS:
- Function Name: ${signature.functionName}
- Parameters: ${signature.parameters.join(', ')}
- Return Type: ${signature.returnType}
- Class Name: ${signature.className || 'N/A'}

Code to execute:
\`\`\`${languageInfo.extension}
${code}
\`\`\`

Test Cases:
${testCases.map((tc, index) => `Test Case ${index + 1}:
Input: ${tc.input}
Expected Output: ${tc.expectedOutput}`).join('\n\n')}

CRITICAL VALIDATION STEPS:
1. FIRST, validate that the code contains the EXACT function signature:
   - Function name must be: ${signature.functionName}
   - Parameters must match: ${signature.parameters.join(', ')}
   - Return type must be: ${signature.returnType}
   ${signature.className ? `- Class name must be: ${signature.className}` : ''}

2. If the function signature is incorrect, return:
   {
     "overallPassed": false,
     "passedCount": 0,
     "totalCount": ${testCases.length},
     "results": [
       {
         "testCaseNumber": 1,
         "input": "N/A",
         "expectedOutput": "N/A",
         "actualOutput": "N/A",
         "passed": false,
         "status": "error",
         "error": "Function signature mismatch. Expected: ${signature.functionName}(${signature.parameters.join(', ')}) -> ${signature.returnType}",
         "executionTime": 0,
         "memoryUsed": 0
       }
     ]
   }

3. If function signature is correct, proceed with execution:
   - Execute the code with each test case input
   - Parse input according to the function signature parameters
   - Call the appropriate function/method with parsed parameters
   - Compare the actual output with expected output
   - Ensure the return type matches the expected output

4. Return results in the following JSON format:
{
  "overallPassed": boolean,
  "passedCount": number,
  "totalCount": number,
  "results": [
    {
      "testCaseNumber": number,
      "input": string,
      "expectedOutput": string,
      "actualOutput": string,
      "passed": boolean,
      "status": "success" | "error",
      "error": string (if any),
      "executionTime": number (in milliseconds),
      "memoryUsed": number (in KB)
    }
  ]
}

Important:
- Only return valid JSON, no additional text
- If there's a compilation error, set status to "error" and provide the error message
- If there's a runtime error, set status to "error" and provide the error message
- For successful execution, set status to "success"
- Estimate execution time and memory usage realistically
- Ensure the JSON is properly formatted and parseable
- Test the function/class with the provided test case inputs
- Parse the input according to the function signature parameters
- Ensure the return type matches the expected output
- Handle edge cases and invalid inputs gracefully
- If function signature validation fails, do NOT attempt to execute the code`;

    return prompt;
  }

  async runCode(code, language, input = '') {
    try {
      this.checkRateLimit();
      
      const prompt = this.buildRunCodePrompt(code, language, input);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseRunCodeResponse(text);
    } catch (error) {
      console.error('Gemini API run code error:', error);
      
      if (error.message.includes('Rate limit')) {
        throw error;
      } else {
        throw new Error(`Code execution failed: ${error.message}`);
      }
    }
  }

  buildRunCodePrompt(code, language, input) {
    const languageInfo = this.getLanguageInfo(language);
    
    let prompt = `You are a code execution assistant. Run the following ${languageInfo.name} code with the given input and return the result.

Code to execute:
\`\`\`${languageInfo.extension}
${code}
\`\`\`

Input: ${input || 'No input provided'}

Instructions:
1. Execute the code with the given input
2. Return the result in the following JSON format:
{
  "status": "success" | "error",
  "output": string,
  "error": string (if any),
  "executionTime": number (in milliseconds),
  "memoryUsed": number (in KB)
}

Important:
- Only return valid JSON, no additional text
- If there's a compilation error, set status to "error" and provide the error message
- If there's a runtime error, set status to "error" and provide the error message
- For successful execution, set status to "success"
- Estimate execution time and memory usage realistically
- Ensure the JSON is properly formatted and parseable
- If no input is provided, run the code as-is
- Handle edge cases and invalid inputs gracefully`;

    return prompt;
  }

  parseRunCodeResponse(response) {
    try {
      // Extract JSON from the response (remove any markdown formatting)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini API');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate the response structure
      if (!parsed.hasOwnProperty('status') || !parsed.hasOwnProperty('output')) {
        throw new Error('Invalid response structure from Gemini API');
      }

      return parsed;
    } catch (error) {
      console.error('Failed to parse Gemini run code response:', error);
      console.error('Raw response:', response);
      
      // Return a fallback response
      return {
        status: 'error',
        output: '',
        error: 'Failed to parse Gemini API response',
        executionTime: 0,
        memoryUsed: 0
      };
    }
  }

  async submitSolution(code, language, problemId, testCases, functionSignature = null) {
    try {
      this.checkRateLimit();
      
      const prompt = this.buildSubmissionPrompt(code, language, testCases, functionSignature);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseSubmissionResponse(text, testCases);
    } catch (error) {
      console.error('Gemini API submission error:', error);
      
      if (error.message.includes('Rate limit')) {
        throw error;
      } else {
        throw new Error(`Solution submission failed: ${error.message}`);
      }
    }
  }

  buildSubmissionPrompt(code, language, testCases, functionSignature = null) {
    const languageInfo = this.getLanguageInfo(language);
    
    let prompt = `You are a code evaluation assistant. Evaluate the following ${languageInfo.name} solution against all test cases to determine if it's correct.`;

    // Add function signature validation if available
    if (functionSignature && functionSignature[language]) {
      const signature = functionSignature[language];
      prompt += `

IMPORTANT FUNCTION SIGNATURE REQUIREMENTS:
- Function Name: ${signature.functionName}
- Parameters: ${signature.parameters.join(', ')}
- Return Type: ${signature.returnType}
- Class Name: ${signature.className || 'N/A'}

CRITICAL: Before execution, validate that the code contains the EXACT function signature. If the function signature is incorrect, the solution should be marked as "compilation_error".`;
    }
    
    prompt += `

Code to evaluate:
\`\`\`${languageInfo.extension}
${code}
\`\`\`

Test Cases:
${testCases.map((tc, index) => `Test Case ${index + 1}:
Input: ${tc.input}
Expected Output: ${tc.expectedOutput}`).join('\n\n')}

Instructions:
1. ${functionSignature && functionSignature[language] ? 'FIRST, validate the function signature matches exactly. If not, return compilation_error.' : ''}
2. Execute the code with each test case input
3. Compare the actual output with expected output
4. Determine if the solution is correct
5. Return results in the following JSON format:
{
  "status": "accepted" | "wrong_answer" | "runtime_error" | "compilation_error",
  "passedTestCases": number,
  "totalTestCases": number,
  "executionTime": number (in milliseconds),
  "memoryUsed": number (in KB),
  "testCaseResults": [
    {
      "testCaseNumber": number,
      "input": string,
      "expectedOutput": string,
      "actualOutput": string,
      "passed": boolean,
      "status": "passed" | "failed",
      "error": string (if any)
    }
  ]
}

Important:
- Only return valid JSON, no additional text
- Set status to "accepted" only if ALL test cases pass
- Set status to "wrong_answer" if any test case fails
- Set status to "runtime_error" if there's a runtime error
- Set status to "compilation_error" if there's a compilation error OR function signature mismatch
- Estimate execution time and memory usage realistically
- Ensure the JSON is properly formatted and parseable
- Handle edge cases and invalid inputs gracefully
- ${functionSignature && functionSignature[language] ? 'If function signature validation fails, return compilation_error immediately without attempting execution.' : ''}`;

    return prompt;
  }

  parseSubmissionResponse(response, testCases) {
    try {
      // Extract JSON from the response (remove any markdown formatting)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini API');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate the response structure
      if (!parsed.hasOwnProperty('status') || !parsed.hasOwnProperty('passedTestCases')) {
        throw new Error('Invalid response structure from Gemini API');
      }

      return parsed;
    } catch (error) {
      console.error('Failed to parse Gemini submission response:', error);
      console.error('Raw response:', response);
      
      // Return a fallback response
      return {
        status: 'compilation_error',
        passedTestCases: 0,
        totalTestCases: testCases.length,
        executionTime: 0,
        memoryUsed: 0,
        testCaseResults: testCases.map((tc, index) => ({
          testCaseNumber: index + 1,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: '',
          passed: false,
          status: 'failed',
          error: 'Failed to parse Gemini API response'
        }))
      };
    }
  }

  // Method to get service status
  getServiceStatus() {
    return {
      status: 'operational',
      apiKey: this.apiKey ? 'configured' : 'missing',
      rateLimit: {
        current: this.requestCount,
        max: this.maxRequestsPerMinute,
        resetTime: new Date(this.lastResetTime + 60000).toISOString()
      }
    };
  }
}

module.exports = GeminiService;
