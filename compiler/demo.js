const { CodeRunner, EXECUTION_STATUS } = require('./core/codeRunner');

/**
 * Simple demonstration of the Code Runner for Online Judge
 * This shows exactly how to integrate it with your Run and Submit buttons
 */

async function demonstrateUsage() {
  const runner = new CodeRunner();

  console.log('🚀 Online Judge Code Execution Engine Demo\n');

  // ===== RUN BUTTON EXAMPLE =====
  console.log('📋 RUN BUTTON SCENARIO:');
  console.log('User writes code and clicks "Run" with custom input\n');

  const userCode = `
# Simple A+B problem
a, b = map(int, input().split())
print(a + b)
  `.trim();

  const customInput = '10 20\n';

  console.log('User Code:');
  console.log(userCode);
  console.log('\nCustom Input:', JSON.stringify(customInput));

  const runResult = await runner.runCode(userCode, 'python', customInput);
  
  console.log('\n📊 EXECUTION RESULT:');
  console.log('Status:', runResult.status);
  console.log('Output:', runResult.stdout);
  console.log('Errors:', runResult.stderr || 'None');
  console.log('Execution Time:', runResult.executionTime + 'ms');
  console.log('Compilation Time:', runResult.compilationTime + 'ms');

  console.log('\n' + '='.repeat(50) + '\n');

  // ===== SUBMIT BUTTON EXAMPLE =====
  console.log('🎯 SUBMIT BUTTON SCENARIO:');
  console.log('User submits solution and we test against all test cases\n');

  // These would normally come from your database
  const testCasesFromDB = [
    { input: '1 1', expectedOutput: '2' },
    { input: '5 3', expectedOutput: '8' },
    { input: '10 10', expectedOutput: '20' },
    { input: '0 0', expectedOutput: '0' },
    { input: '100 200', expectedOutput: '300' }
  ];

  console.log('Test Cases from Database:');
  testCasesFromDB.forEach((tc, i) => {
    console.log(`  Test ${i + 1}: Input="${tc.input}" Expected="${tc.expectedOutput}"`);
  });

  const submitResult = await runner.runTests(userCode, 'python', testCasesFromDB);

  console.log('\n🏆 FINAL VERDICT:');
  console.log('Status:', submitResult.status);
  console.log('Passed Tests:', `${submitResult.passedTests}/${submitResult.totalTests}`);
  console.log('Total Execution Time:', submitResult.totalExecutionTime + 'ms');
  console.log('Compilation Time:', submitResult.compilationTime + 'ms');

  if (submitResult.status === EXECUTION_STATUS.ACCEPTED) {
    console.log('🎉 ACCEPTED! All test cases passed!');
  } else {
    console.log('❌ Not accepted. Issue with test case:', submitResult.results[submitResult.passedTests]?.testCase);
  }

  console.log('\n📝 Detailed Test Results:');
  submitResult.results.forEach((result) => {
    const icon = result.status === EXECUTION_STATUS.ACCEPTED ? '✅' : '❌';
    console.log(`  ${icon} Test ${result.testCase}: ${result.status} (${result.executionTime}ms)`);
    if (result.status !== EXECUTION_STATUS.ACCEPTED) {
      console.log(`    Expected: "${result.expectedOutput}"`);
      console.log(`    Got: "${result.actualOutput}"`);
    }
  });

  console.log('\n' + '='.repeat(50) + '\n');

  // ===== ERROR SCENARIOS =====
  console.log('⚠️  ERROR HANDLING EXAMPLES:');

  // Wrong Answer Example
  const wrongCode = `
a, b = map(int, input().split())
print(a * b)  # Wrong operation - should be addition
  `.trim();

  console.log('\n1. Wrong Answer Example:');
  const wrongResult = await runner.runTests(wrongCode, 'python', [
    { input: '2 3', expectedOutput: '5' }
  ]);
  console.log('Result:', wrongResult.status);
  console.log('Expected: 5, Got:', wrongResult.results[0]?.actualOutput);

  // Runtime Error Example
  const errorCode = `
a, b = map(int, input().split())
result = a / b
print(int(result))
  `.trim();

  console.log('\n2. Runtime Error Example (Division by Zero):');
  const errorResult = await runner.runCode(errorCode, 'python', '5 0\n');
  console.log('Result:', errorResult.status);
  console.log('Error:', errorResult.stderr ? 'Division by zero detected' : 'No error');

  console.log('\n✨ Demo completed! Your Online Judge is ready to execute code!');
}

// For integration with your existing backend routes
function createRouteExample() {
  return `
// Add this to your existing routes/problems.js file:

const { CodeRunner } = require('../compiler');

// Route for Run button
router.post('/run-code', auth, async (req, res) => {
  try {
    const { code, language, stdin } = req.body;
    const runner = new CodeRunner();
    const result = await runner.runCode(code, language, stdin || '');
    
    res.json({
      success: true,
      data: {
        status: result.status,
        output: result.stdout,
        error: result.stderr,
        executionTime: result.executionTime,
        compilationTime: result.compilationTime
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route for Submit button
router.post('/submit-solution', auth, async (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    
    // Get test cases from your database
    const testCases = await TestCase.find({ problemId });
    
    const runner = new CodeRunner();
    const result = await runner.runTests(code, language, testCases);
    
    // Save submission to database
    const submission = new Submission({
      userId: req.user.id,
      problemId,
      code,
      language,
      status: result.status,
      passedTests: result.passedTests,
      totalTests: result.totalTests,
      executionTime: result.totalExecutionTime
    });
    
    await submission.save();
    
    res.json({
      success: true,
      data: {
        submissionId: submission._id,
        status: result.status,
        verdict: result.status,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        executionTime: result.totalExecutionTime
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
  `;
}

// Run the demonstration
if (require.main === module) {
  demonstrateUsage().catch(console.error);
}

module.exports = { demonstrateUsage, createRouteExample };
