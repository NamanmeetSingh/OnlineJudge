const { v4: uuidv4 } = require('uuid');

class FunctionWrapperService {
  constructor() {
    this.supportedLanguages = ['python', 'javascript', 'java', 'cpp', 'c'];
  }

  /**
   * Wraps user function with test case execution logic
   * @param {Object} params - Parameters object
   * @param {string} params.code - User's function code
   * @param {string} params.language - Programming language
   * @param {Array} params.testCases - Array of test cases with input/expectedOutput
   * @param {Object} params.functionTemplate - Function signature and template info
   * @returns {string} - Complete executable code with test cases
   */
  wrapFunctionWithTests({ code, language, testCases, functionTemplate }) {
    switch (language.toLowerCase()) {
      case 'python':
        return this.wrapPythonFunction(code, testCases, functionTemplate);
      case 'javascript':
        return this.wrapJavaScriptFunction(code, testCases, functionTemplate);
      case 'java':
        return this.wrapJavaFunction(code, testCases, functionTemplate);
      case 'cpp':
        return this.wrapCppFunction(code, testCases, functionTemplate);
      case 'c':
        return this.wrapCFunction(code, testCases, functionTemplate);
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  wrapPythonFunction(userCode, testCases, functionTemplate) {
    const { functionName, parameters, returnType } = functionTemplate;
    
    // Create test execution code
    const testCode = `
import json
import sys
from typing import List

${userCode}

# Test case execution
def run_tests():
    test_cases = ${JSON.stringify(testCases)}
    results = []
    
    # Create solution instance
    solution = Solution()
    
    for i, test_case in enumerate(test_cases):
        try:
            # Parse input based on problem structure
            inputs = parse_input(test_case['input'])
            
            # Call user function with proper arguments
            if hasattr(solution, '${functionName}'):
                method = getattr(solution, '${functionName}')
                result = method(*inputs)
            else:
                # Try calling as standalone function
                result = ${functionName}(*inputs)
            
            # Convert result to string for comparison
            actual_output = format_output(result)
            expected_output = test_case['expectedOutput'].strip()
            
            test_result = {
                'testCase': i + 1,
                'status': 'passed' if actual_output == expected_output else 'failed',
                'input': test_case['input'],
                'expected': expected_output,
                'actual': actual_output,
                'passed': actual_output == expected_output
            }
            
        except Exception as e:
            test_result = {
                'testCase': i + 1,
                'status': 'error',
                'input': test_case['input'],
                'expected': test_case['expectedOutput'],
                'actual': '',
                'error': str(e),
                'passed': False
            }
        
        results.append(test_result)
    
    return results

def parse_input(input_str):
    """Parse input string into function arguments"""
    if not input_str.strip():
        return []
    
    lines = [line.strip() for line in input_str.strip().split('\\n') if line.strip()]
    parsed_args = []
    
    for line in lines:
        if line.startswith('[') and line.endswith(']'):
            # Array input: [1,2,3,4] -> [1, 2, 3, 4]
            try:
                parsed_args.append(eval(line))
            except:
                # Fallback: parse as comma-separated integers
                content = line[1:-1]  # Remove brackets
                if content:
                    parsed_args.append([int(x.strip()) for x in content.split(',')])
                else:
                    parsed_args.append([])
        else:
            # Single value: could be integer, string, etc.
            try:
                # Try parsing as integer
                parsed_args.append(int(line))
            except:
                try:
                    # Try parsing as float
                    parsed_args.append(float(line))
                except:
                    # Keep as string
                    parsed_args.append(line)
    
    return parsed_args

def format_output(result):
    """Format function output for comparison"""
    if isinstance(result, list):
        return str(result)
    elif isinstance(result, tuple):
        return str(list(result))
    elif isinstance(result, bool):
        return str(result).lower()
    else:
        return str(result)

if __name__ == "__main__":
    try:
        results = run_tests()
        
        # Print results in a format the compiler can parse
        passed_count = sum(1 for r in results if r['passed'])
        total_count = len(results)
        
        print(f"TEST_RESULTS: {passed_count}/{total_count}")
        
        for result in results:
            status = "PASS" if result['passed'] else "FAIL"
            print(f"Test {result['testCase']}: {status}")
            if not result['passed']:
                print(f"  Input: {result['input']}")
                print(f"  Expected: {result['expected']}")
                print(f"  Actual: {result['actual']}")
                if 'error' in result:
                    print(f"  Error: {result['error']}")
    
    except Exception as e:
        print(f"EXECUTION_ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
`;

    return testCode;
  }

  wrapJavaScriptFunction(userCode, testCases, functionTemplate) {
    const { functionName, parameters } = functionTemplate;
    
    const testCode = `
${userCode}

// Test case execution
function runTests() {
    const testCases = ${JSON.stringify(testCases)};
    const results = [];
    
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        try {
            // Parse input based on problem structure
            const inputs = parseInput(testCase.input);
            
            // Call user function
            let result;
            if (typeof ${functionName} === 'function') {
                result = ${functionName}(...inputs);
            } else {
                throw new Error('Function ${functionName} not found');
            }
            
            // Convert result to string for comparison
            const actualOutput = formatOutput(result);
            const expectedOutput = testCase.expectedOutput.trim();
            
            const testResult = {
                testCase: i + 1,
                status: actualOutput === expectedOutput ? 'passed' : 'failed',
                input: testCase.input,
                expected: expectedOutput,
                actual: actualOutput,
                passed: actualOutput === expectedOutput
            };
            
            results.push(testResult);
            
        } catch (error) {
            results.push({
                testCase: i + 1,
                status: 'error',
                input: testCase.input,
                expected: testCase.expectedOutput,
                actual: '',
                error: error.message,
                passed: false
            });
        }
    }
    
    return results;
}

function parseInput(inputStr) {
    if (!inputStr.trim()) {
        return [];
    }
    
    const lines = inputStr.trim().split('\\n').filter(line => line.trim());
    const parsedArgs = [];
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            // Array input: [1,2,3,4] -> [1, 2, 3, 4]
            try {
                parsedArgs.push(JSON.parse(trimmed));
            } catch (e) {
                // Fallback: parse as comma-separated integers
                const content = trimmed.slice(1, -1); // Remove brackets
                if (content) {
                    parsedArgs.push(content.split(',').map(x => parseInt(x.trim())));
                } else {
                    parsedArgs.push([]);
                }
            }
        } else {
            // Single value: could be integer, string, etc.
            const num = parseInt(trimmed);
            if (!isNaN(num)) {
                parsedArgs.push(num);
            } else {
                parsedArgs.push(trimmed);
            }
        }
    }
    
    return parsedArgs;
}

function formatOutput(result) {
    if (Array.isArray(result)) {
        return JSON.stringify(result);
    } else if (typeof result === 'boolean') {
        return result.toString();
    } else {
        return String(result);
    }
}

// Run tests and output results
try {
    const results = runTests();
    
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    
    console.log(\`TEST_RESULTS: \${passedCount}/\${totalCount}\`);
    
    for (const result of results) {
        const status = result.passed ? "PASS" : "FAIL";
        console.log(\`Test \${result.testCase}: \${status}\`);
        if (!result.passed) {
            console.log(\`  Input: \${result.input}\`);
            console.log(\`  Expected: \${result.expected}\`);
            console.log(\`  Actual: \${result.actual}\`);
            if (result.error) {
                console.log(\`  Error: \${result.error}\`);
            }
        }
    }
    
} catch (error) {
    console.log(\`EXECUTION_ERROR: \${error.message}\`);
    process.exit(1);
}
`;

    return testCode;
  }

  wrapJavaFunction(userCode, testCases, functionTemplate) {
    const { functionName, parameters, className = 'Solution' } = functionTemplate;
    
    const testCode = `
import java.util.*;
import java.util.stream.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        try {
            Solution solution = new Solution();
            List<TestCase> testCases = Arrays.asList(
                ${testCases.map(tc => `new TestCase("${tc.input.replace(/\n/g, '\\n')}", "${tc.expectedOutput}")`).join(',\n                ')}
            );
            
            int passedCount = 0;
            int totalCount = testCases.size();
            
            for (int i = 0; i < testCases.size(); i++) {
                TestCase testCase = testCases.get(i);
                try {
                    Object[] inputs = parseInput(testCase.input);
                    Object result = callSolutionMethod(solution, "${functionName}", inputs);
                    
                    String actualOutput = String.valueOf(result);
                    String expectedOutput = testCase.expectedOutput.trim();
                    
                    boolean passed = actualOutput.equals(expectedOutput);
                    if (passed) passedCount++;
                    
                    System.out.println("Test " + (i + 1) + ": " + (passed ? "PASS" : "FAIL"));
                    if (!passed) {
                        System.out.println("  Input: " + testCase.input);
                        System.out.println("  Expected: " + expectedOutput);
                        System.out.println("  Actual: " + actualOutput);
                    }
                    
                } catch (Exception e) {
                    System.out.println("Test " + (i + 1) + ": FAIL");
                    System.out.println("  Input: " + testCase.input);
                    System.out.println("  Error: " + e.getMessage());
                }
            }
            
            System.out.println("TEST_RESULTS: " + passedCount + "/" + totalCount);
            
        } catch (Exception e) {
            System.out.println("EXECUTION_ERROR: " + e.getMessage());
            System.exit(1);
        }
    }
    
    static class TestCase {
        String input;
        String expectedOutput;
        
        TestCase(String input, String expectedOutput) {
            this.input = input;
            this.expectedOutput = expectedOutput;
        }
    }
    
    static Object[] parseInput(String inputStr) {
        if (inputStr.trim().isEmpty()) {
            return new Object[0];
        }
        
        String[] lines = inputStr.trim().split("\\n");
        List<Object> parsed = new ArrayList<>();
        
        for (String line : lines) {
            line = line.trim();
            if (!line.isEmpty()) {
                if (line.contains(" ")) {
                    String[] parts = line.split(" ");
                    int[] nums = new int[parts.length];
                    for (int i = 0; i < parts.length; i++) {
                        nums[i] = Integer.parseInt(parts[i]);
                    }
                    parsed.add(nums);
                } else {
                    try {
                        parsed.add(Integer.parseInt(line));
                    } catch (NumberFormatException e) {
                        parsed.add(line);
                    }
                }
            }
        }
        
        return parsed.toArray();
    }
    
    static Object callSolutionMethod(Solution solution, String methodName, Object[] inputs) throws Exception {
        // This is a simplified approach - in practice, you'd use reflection
        // For now, we'll handle common method signatures
        if (methodName.equals("twoSum") && inputs.length >= 2) {
            return solution.twoSum((int[])inputs[0], (int)inputs[1]);
        }
        // Add more method signatures as needed
        
        throw new Exception("Method " + methodName + " not implemented in wrapper");
    }
}
`;

    return testCode;
  }

  wrapCppFunction(userCode, testCases, functionTemplate) {
    const { functionName, parameters } = functionTemplate;
    
    const testCode = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

${userCode}

struct TestCase {
    string input;
    string expectedOutput;
    
    TestCase(string inp, string exp) : input(inp), expectedOutput(exp) {}
};

vector<int> parseIntArray(string line) {
    vector<int> result;
    stringstream ss(line);
    int num;
    while (ss >> num) {
        result.push_back(num);
    }
    return result;
}

int main() {
    vector<TestCase> testCases = {
        ${testCases.map(tc => `TestCase("${tc.input.replace(/\n/g, '\\n')}", "${tc.expectedOutput}")`).join(',\n        ')}
    };
    
    int passedCount = 0;
    int totalCount = testCases.size();
    
    for (int i = 0; i < testCases.size(); i++) {
        try {
            TestCase& testCase = testCases[i];
            stringstream inputStream(testCase.input);
            
            // Parse input based on the problem
            // This is a simplified parser - would need to be enhanced for complex inputs
            string line;
            vector<string> lines;
            while (getline(inputStream, line)) {
                if (!line.empty()) {
                    lines.push_back(line);
                }
            }
            
            // Call the solution function
            // This would need to be customized based on the function signature
            string result = ""; // Placeholder - actual implementation depends on function
            
            string expectedOutput = testCase.expectedOutput;
            bool passed = (result == expectedOutput);
            
            if (passed) passedCount++;
            
            cout << "Test " << (i + 1) << ": " << (passed ? "PASS" : "FAIL") << endl;
            if (!passed) {
                cout << "  Input: " << testCase.input << endl;
                cout << "  Expected: " << expectedOutput << endl;
                cout << "  Actual: " << result << endl;
            }
            
        } catch (const exception& e) {
            cout << "Test " << (i + 1) << ": FAIL" << endl;
            cout << "  Error: " << e.what() << endl;
        }
    }
    
    cout << "TEST_RESULTS: " << passedCount << "/" << totalCount << endl;
    
    return 0;
}
`;

    return testCode;
  }

  wrapCFunction(userCode, testCases, functionTemplate) {
    // Similar to C++ but with C syntax
    return this.wrapCppFunction(userCode, testCases, functionTemplate)
      .replace('#include <iostream>', '#include <stdio.h>')
      .replace('#include <vector>', '')
      .replace('#include <string>', '#include <string.h>')
      .replace('#include <sstream>', '')
      .replace('using namespace std;', '')
      .replace('vector<', 'int* ')
      .replace('string', 'char*')
      .replace('cout <<', 'printf(')
      .replace('<< endl', '\\n"');
  }

  /**
   * Extracts function signature from user code
   * @param {string} code - User's code
   * @param {string} language - Programming language
   * @returns {Object} Function template information
   */
  extractFunctionTemplate(code, language) {
    switch (language.toLowerCase()) {
      case 'python':
        return this.extractPythonFunction(code);
      case 'javascript':
        return this.extractJavaScriptFunction(code);
      case 'java':
        return this.extractJavaFunction(code);
      case 'cpp':
      case 'c':
        return this.extractCppFunction(code);
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  extractPythonFunction(code) {
    const functionRegex = /def\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*([^:]+))?:/;
    const match = code.match(functionRegex);
    
    if (!match) {
      throw new Error('No function definition found in Python code');
    }
    
    return {
      functionName: match[1],
      parameters: match[2].split(',').map(p => p.trim()).filter(p => p),
      returnType: match[3] ? match[3].trim() : 'any'
    };
  }

  extractJavaScriptFunction(code) {
    const functionRegex = /(?:function\s+(\w+)|(\w+)\s*=\s*(?:function|\([^)]*\)\s*=>))\s*\([^)]*\)/;
    const match = code.match(functionRegex);
    
    if (!match) {
      throw new Error('No function definition found in JavaScript code');
    }
    
    return {
      functionName: match[1] || match[2],
      parameters: [], // Would need more sophisticated parsing
      returnType: 'any'
    };
  }

  extractJavaFunction(code) {
    const functionRegex = /public\s+(?:static\s+)?(\w+)\s+(\w+)\s*\(([^)]*)\)/;
    const match = code.match(functionRegex);
    
    if (!match) {
      throw new Error('No public method found in Java code');
    }
    
    return {
      functionName: match[2],
      parameters: match[3].split(',').map(p => p.trim()).filter(p => p),
      returnType: match[1],
      className: 'Solution' // Default class name
    };
  }

  extractCppFunction(code) {
    const functionRegex = /(\w+)\s+(\w+)\s*\(([^)]*)\)/;
    const match = code.match(functionRegex);
    
    if (!match) {
      throw new Error('No function definition found in C++ code');
    }
    
    return {
      functionName: match[2],
      parameters: match[3].split(',').map(p => p.trim()).filter(p => p),
      returnType: match[1]
    };
  }
}

module.exports = FunctionWrapperService;
