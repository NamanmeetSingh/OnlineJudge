const { CodeRunner, EXECUTION_STATUS } = require('./core/codeRunner');

/**
 * Test examples for the CodeRunner
 * This demonstrates how to use the runner for both single execution (Run button)
 * and multiple test cases (Submit button)
 */

async function testCodeRunner() {
  const runner = new CodeRunner();

  console.log('=== Code Runner Test Suite ===\n');

  // Test 1: Simple Python Hello World (Run button scenario)
  console.log('1. Testing Python Hello World (Run functionality):');
  const pythonCode = `
name = input("Enter your name: ")
print(f"Hello, {name}!")
print("Welcome to Online Judge!")
  `.trim();

  const pythonResult = await runner.runCode(pythonCode, 'python', 'Alice\n');
  console.log('Result:', {
    status: pythonResult.status,
    stdout: pythonResult.stdout,
    stderr: pythonResult.stderr,
    executionTime: pythonResult.executionTime + 'ms',
    compilationTime: pythonResult.compilationTime + 'ms'
  });
  console.log('');

  // Test 2: C++ program with compilation (Run button scenario)
  console.log('2. Testing C++ program (Run functionality):');
  const cppCode = `
#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << "Sum: " << (a + b) << endl;
    return 0;
}
  `.trim();

  const cppResult = await runner.runCode(cppCode, 'cpp', '5 3\n');
  console.log('Result:', {
    status: cppResult.status,
    stdout: cppResult.stdout,
    stderr: cppResult.stderr,
    executionTime: cppResult.executionTime + 'ms',
    compilationTime: cppResult.compilationTime + 'ms'
  });
  console.log('');

  // Test 3: JavaScript program (Run button scenario)
  console.log('3. Testing JavaScript program (Run functionality):');
  const jsCode = `
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('', (input) => {
  const numbers = input.split(' ').map(Number);
  const result = numbers.reduce((sum, num) => sum + num, 0);
  console.log('Total:', result);
  rl.close();
});
  `.trim();

  const jsResult = await runner.runCode(jsCode, 'javascript', '1 2 3 4 5\n');
  console.log('Result:', {
    status: jsResult.status,
    stdout: jsResult.stdout,
    stderr: jsResult.stderr,
    executionTime: jsResult.executionTime + 'ms'
  });
  console.log('');

  // Test 4: Multiple test cases (Submit button scenario)
  console.log('4. Testing with multiple test cases (Submit functionality):');
  const problemCode = `
a, b = map(int, input().split())
print(a + b)
  `.trim();

  const testCases = [
    { input: '1 2', expectedOutput: '3' },
    { input: '5 7', expectedOutput: '12' },
    { input: '10 20', expectedOutput: '30' },
    { input: '0 0', expectedOutput: '0' }
  ];

  const testResult = await runner.runTests(problemCode, 'python', testCases);
  console.log('Test Results:', {
    overallStatus: testResult.status,
    passedTests: testResult.passedTests,
    totalTests: testResult.totalTests,
    totalExecutionTime: testResult.totalExecutionTime + 'ms',
    compilationTime: testResult.compilationTime + 'ms'
  });

  testResult.results.forEach((result, index) => {
    console.log(`  Test ${index + 1}:`, {
      status: result.status,
      input: result.input,
      expected: result.expectedOutput,
      actual: result.actualOutput,
      time: result.executionTime + 'ms'
    });
  });
  console.log('');

  // Test 5: Compilation Error
  console.log('5. Testing compilation error:');
  const badCppCode = `
#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << "Sum: " << (a + b) << endl; // Missing semicolon intentionally
    return 0;
// Missing closing brace
  `.trim();

  const errorResult = await runner.runCode(badCppCode, 'cpp', '5 3\n');
  console.log('Result:', {
    status: errorResult.status,
    stderr: errorResult.stderr ? 'Compilation errors found' : 'No errors',
    compilationTime: errorResult.compilationTime + 'ms'
  });
  console.log('');

  // Test 6: Runtime Error
  console.log('6. Testing runtime error:');
  const runtimeErrorCode = `
x = int(input())
result = 10 / x  # Division by zero if input is 0
print(result)
  `.trim();

  const runtimeResult = await runner.runCode(runtimeErrorCode, 'python', '0\n');
  console.log('Result:', {
    status: runtimeResult.status,
    stderr: runtimeResult.stderr ? 'Runtime error occurred' : 'No errors',
    executionTime: runtimeResult.executionTime + 'ms'
  });
  console.log('');

  // Test 7: Time Limit Exceeded
  console.log('7. Testing time limit exceeded:');
  const infiniteLoopCode = `
while True:
    pass
  `.trim();

  const timeoutResult = await runner.runCode(infiniteLoopCode, 'python', '');
  console.log('Result:', {
    status: timeoutResult.status,
    executionTime: timeoutResult.executionTime + 'ms'
  });
  console.log('');

  console.log('=== All tests completed ===');
}

// Integration example for Express.js API
function createExpressRoutes() {
  return `
// Example Express.js routes for integrating with your backend

const express = require('express');
const { CodeRunner, EXECUTION_STATUS } = require('./compiler');
const router = express.Router();

// Route for "Run" button - single execution with custom input
router.post('/run', async (req, res) => {
  try {
    const { code, language, stdin } = req.body;
    
    // Validate required fields
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Code and language are required'
      });
    }

    const runner = new CodeRunner();
    const result = await runner.runCode(code, language, stdin || '');

    res.json({
      success: true,
      result: {
        status: result.status,
        stdout: result.stdout,
        stderr: result.stderr,
        executionTime: result.executionTime,
        compilationTime: result.compilationTime
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Route for "Submit" button - run against test cases from database
router.post('/submit', async (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    
    // Validate required fields
    if (!code || !language || !problemId) {
      return res.status(400).json({
        success: false,
        error: 'Code, language, and problemId are required'
      });
    }

    // Fetch test cases from database (you'll need to implement this)
    // const testCases = await getTestCasesFromDatabase(problemId);
    
    // For demo purposes, using dummy test cases
    const testCases = [
      { input: '1 2', expectedOutput: '3' },
      { input: '5 7', expectedOutput: '12' }
    ];

    const runner = new CodeRunner();
    const result = await runner.runTests(code, language, testCases);

    // Save submission to database (you'll need to implement this)
    // await saveSubmissionToDatabase(userId, problemId, code, language, result);

    res.json({
      success: true,
      result: {
        status: result.status,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        totalExecutionTime: result.totalExecutionTime,
        compilationTime: result.compilationTime,
        details: result.results
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;
  `;
}

// Run tests if this file is executed directly
if (require.main === module) {
  testCodeRunner().catch(console.error);
}

module.exports = { testCodeRunner, createExpressRoutes };
