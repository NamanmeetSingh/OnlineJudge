/**
 * API Test Client for the Code Execution Server
 * 
 * This script tests all the API endpoints to ensure the standalone server
 * is working correctly for both Run and Submit functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

/**
 * Test the health endpoint
 */
async function testHealth() {
  console.log('🏥 Testing Health Endpoints...\n');
  
  try {
    // Basic health check
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Basic Health Check:', {
      status: health.data.status,
      uptime: health.data.uptime.human,
      memory: `${health.data.memory.used}MB used`
    });

    // Detailed health check
    const detailed = await axios.get(`${BASE_URL}/health/detailed`);
    console.log('✅ Detailed Health Check:', {
      status: detailed.data.status,
      languages: detailed.data.codeExecution.supportedLanguages.length,
      tempDir: detailed.data.codeExecution.tempDirectory.status
    });

    // Compiler availability
    const compilers = await axios.get(`${BASE_URL}/health/compilers`);
    console.log('✅ Compiler Availability:', {
      status: compilers.data.status,
      available: compilers.data.compilers.available.length,
      missing: compilers.data.compilers.missing.length
    });

  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
  
  console.log('');
}

/**
 * Test the information endpoints
 */
async function testInformation() {
  console.log('📋 Testing Information Endpoints...\n');
  
  try {
    // Supported languages
    const languages = await axios.get(`${BASE_URL}/execute/languages`);
    console.log('✅ Supported Languages:', 
      languages.data.data.supportedLanguages.map(l => l.displayName).join(', ')
    );

    // Execution limits
    const limits = await axios.get(`${BASE_URL}/execute/limits`);
    console.log('✅ Execution Limits:', {
      maxExecutionTime: limits.data.data.maxExecutionTime + 'ms',
      maxCodeSize: (limits.data.data.maxCodeSize / 1024) + 'KB',
      maxTestCases: limits.data.data.maxTestCases
    });

  } catch (error) {
    console.error('❌ Information endpoints failed:', error.message);
  }
  
  console.log('');
}

/**
 * Test the Run functionality (single code execution)
 */
async function testRunFunctionality() {
  console.log('🏃 Testing Run Functionality...\n');

  // Test 1: Simple Python code
  try {
    const pythonTest = await axios.post(`${BASE_URL}/execute/run`, {
      code: 'name = input("Enter name: ")\\nprint(f"Hello, {name}!")',
      language: 'python',
      stdin: 'Alice\\n'
    });
    
    console.log('✅ Python Execution:', {
      status: pythonTest.data.data.status,
      output: pythonTest.data.data.output,
      time: pythonTest.data.data.executionTime + 'ms'
    });
  } catch (error) {
    console.error('❌ Python test failed:', error.response?.data || error.message);
  }

  // Test 2: JavaScript code
  try {
    const jsTest = await axios.post(`${BASE_URL}/execute/run`, {
      code: 'const input = require("fs").readFileSync(0, "utf8").trim();\\nconsole.log("Echo:", input);',
      language: 'javascript',
      stdin: 'Hello JavaScript\\n'
    });
    
    console.log('✅ JavaScript Execution:', {
      status: jsTest.data.data.status,
      output: jsTest.data.data.output,
      time: jsTest.data.data.executionTime + 'ms'
    });
  } catch (error) {
    console.error('❌ JavaScript test failed:', error.response?.data || error.message);
  }

  // Test 3: C++ code (if compiler available)
  try {
    const cppTest = await axios.post(`${BASE_URL}/execute/run`, {
      code: '#include <iostream>\\nusing namespace std;\\nint main() {\\n    int a, b;\\n    cin >> a >> b;\\n    cout << "Sum: " << (a + b) << endl;\\n    return 0;\\n}',
      language: 'cpp',
      stdin: '5 3\\n'
    });
    
    console.log('✅ C++ Execution:', {
      status: cppTest.data.data.status,
      output: cppTest.data.data.output,
      time: cppTest.data.data.executionTime + 'ms'
    });
  } catch (error) {
    console.error('⚠️  C++ test failed (compiler may not be installed):', 
      error.response?.data?.data?.message || error.message);
  }

  console.log('');
}

/**
 * Test the Submit functionality (multiple test cases)
 */
async function testSubmitFunctionality() {
  console.log('🎯 Testing Submit Functionality...\n');

  // Test with A+B problem
  const testCases = [
    { input: '1 2', expectedOutput: '3' },
    { input: '5 7', expectedOutput: '12' },
    { input: '10 20', expectedOutput: '30' },
    { input: '0 0', expectedOutput: '0' }
  ];

  try {
    const submitTest = await axios.post(`${BASE_URL}/execute/submit`, {
      code: 'a, b = map(int, input().split())\\nprint(a + b)',
      language: 'python',
      testCases,
      problemId: 'test-a-plus-b'
    });
    
    console.log('✅ Submit Test (A+B Problem):', {
      verdict: submitTest.data.data.verdict,
      passed: `${submitTest.data.data.passedTests}/${submitTest.data.data.totalTests}`,
      totalTime: submitTest.data.data.totalTime + 'ms'
    });

    // Show individual test results
    if (submitTest.data.data.testResults) {
      submitTest.data.data.testResults.forEach((test, i) => {
        const status = test.status === 'Accepted' ? '✅' : '❌';
        console.log(`  ${status} Test ${i + 1}: ${test.status} (${test.executionTime}ms)`);
      });
    }

  } catch (error) {
    console.error('❌ Submit test failed:', error.response?.data || error.message);
  }

  console.log('');
}

/**
 * Test error handling
 */
async function testErrorHandling() {
  console.log('⚠️  Testing Error Handling...\n');

  // Test 1: Compilation error
  try {
    const compileErrorTest = await axios.post(`${BASE_URL}/execute/run`, {
      code: '#include <iostream>\\nusing namespace std;\\nint main() {\\n    cout << "Missing semicolon"\\n    return 0;\\n}',
      language: 'cpp'
    });
    
    console.log('⚠️  Compilation Error Test:', {
      status: compileErrorTest.data.data.status,
      hasError: compileErrorTest.data.data.error ? 'Yes' : 'No'
    });
  } catch (error) {
    console.log('✅ Compilation Error Test: Error properly handled');
  }

  // Test 2: Runtime error
  try {
    const runtimeErrorTest = await axios.post(`${BASE_URL}/execute/run`, {
      code: 'x = int(input())\\nresult = 10 / x\\nprint(result)',
      language: 'python',
      stdin: '0\\n'
    });
    
    console.log('⚠️  Runtime Error Test:', {
      status: runtimeErrorTest.data.data.status,
      hasError: runtimeErrorTest.data.data.error ? 'Yes' : 'No'
    });
  } catch (error) {
    console.log('✅ Runtime Error Test: Error properly handled');
  }

  // Test 3: Invalid language
  try {
    const invalidLangTest = await axios.post(`${BASE_URL}/execute/run`, {
      code: 'print("test")',
      language: 'invalid-language'
    });
  } catch (error) {
    console.log('✅ Invalid Language Test: Properly rejected');
  }

  // Test 4: Missing required fields
  try {
    const missingFieldTest = await axios.post(`${BASE_URL}/execute/run`, {
      language: 'python'
      // Missing code field
    });
  } catch (error) {
    console.log('✅ Missing Fields Test: Properly validated');
  }

  console.log('');
}

/**
 * Test rate limiting (be careful not to trigger it during development)
 */
async function testRateLimiting() {
  console.log('🚦 Testing Rate Limiting (light test)...\n');

  try {
    // Make a few requests to check rate limiting headers
    const response = await axios.post(`${BASE_URL}/execute/run`, {
      code: 'print("Rate limit test")',
      language: 'python'
    });

    console.log('✅ Rate Limiting Headers:', {
      remaining: response.headers['x-ratelimit-remaining'] || 'Not set',
      limit: response.headers['x-ratelimit-limit'] || 'Not set',
      reset: response.headers['x-ratelimit-reset'] || 'Not set'
    });

  } catch (error) {
    console.error('❌ Rate limiting test failed:', error.message);
  }

  console.log('');
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🧪 ================================');
  console.log('🧪 API Test Suite for Compiler Server');
  console.log('🧪 ================================\\n');

  await testHealth();
  await testInformation();
  await testRunFunctionality();
  await testSubmitFunctionality();
  await testErrorHandling();
  await testRateLimiting();

  console.log('🎉 ================================');
  console.log('🎉 All API tests completed!');
  console.log('🎉 ================================');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
