const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const FunctionWrapperService = require('./FunctionWrapperService');

class SimpleCompilerService {
  constructor() {
    this.tempDir = path.join(__dirname, '..', '..', 'temp');
    this.functionWrapper = new FunctionWrapperService();
    this.executionStats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      languageStats: {}
    };

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/compiler.log' })
      ]
    });

    // Language configurations
    this.languageConfigs = {
      javascript: {
        fileExtension: '.js',
        runCommand: 'node',
        timeout: 10000
      },
      python: {
        fileExtension: '.py',
        runCommand: 'python',
        timeout: 10000
      },
      java: {
        fileExtension: '.java',
        compileCommand: 'javac',
        runCommand: 'java',
        timeout: 15000,
        className: 'Main'
      },
      cpp: {
        fileExtension: '.cpp',
        compileCommand: 'g++',
        runCommand: '',
        timeout: 15000
      },
      c: {
        fileExtension: '.c',
        compileCommand: 'gcc',
        runCommand: '',
        timeout: 15000
      }
    };

    this.ensureDirectories();
  }

  async ensureDirectories() {
    await fs.ensureDir(this.tempDir);
    await fs.ensureDir(path.join(__dirname, '..', '..', 'logs'));
  }

  getSupportedLanguages() {
    return Object.keys(this.languageConfigs).map(lang => ({
      name: lang,
      displayName: this.getLanguageDisplayName(lang),
      fileExtension: this.languageConfigs[lang].fileExtension
    }));
  }

  getLanguageDisplayName(language) {
    const displayNames = {
      javascript: 'JavaScript',
      python: 'Python',
      java: 'Java',
      cpp: 'C++',
      c: 'C'
    };
    return displayNames[language] || language;
  }

  async executeCode({ code, language, input = '', timeLimit = 10 }) {
    const executionId = uuidv4();

    try {
      this.executionStats.totalExecutions++;
      this.updateLanguageStats(language);

      this.logger.info(`Starting code execution: ${executionId}`, {
        language,
        codeLength: code.length,
        inputLength: input.length
      });

      const config = this.languageConfigs[language];
      if (!config) {
        throw new Error(`Unsupported language: ${language}`);
      }

      // Create execution directory
      const execDir = path.join(this.tempDir, executionId);
      await fs.ensureDir(execDir);

      // Write code to file
      const fileName = language === 'java' ? 'Main.java' : `main${config.fileExtension}`;
      const filePath = path.join(execDir, fileName);
      await fs.writeFile(filePath, code);

      // Write input to file
      const inputPath = path.join(execDir, 'input.txt');
      await fs.writeFile(inputPath, input);

      let result;

      // Compile if needed
      if (config.compileCommand) {
        const compileResult = await this.runCommand(config.compileCommand, [filePath], execDir, 30000);
        if (compileResult.error) {
          return {
            executionId,
            status: 'error',
            output: '',
            error: `Compilation Error:\n${compileResult.stderr}`,
            executionTime: 0,
            memoryUsed: 0,
            language,
            timestamp: new Date().toISOString()
          };
        }
      }

      // Execute code
      const runArgs = this.buildRunArgs(language, fileName, execDir);
      result = await this.runCommand(runArgs.command, runArgs.args, execDir, timeLimit * 1000, input);

      const response = {
        executionId,
        status: result.error ? 'error' : 'success',
        output: result.stdout || '',
        error: result.stderr || '',
        executionTime: result.executionTime || 0,
        memoryUsed: 0, // Cannot easily measure without Docker
        language,
        timestamp: new Date().toISOString()
      };

      if (!result.error) {
        this.executionStats.successfulExecutions++;
      } else {
        this.executionStats.failedExecutions++;
      }

      // Clean up
      await fs.remove(execDir);

      return response;

    } catch (error) {
      this.executionStats.failedExecutions++;
      this.logger.error(`Code execution failed: ${executionId}`, {
        error: error.message,
        language
      });

      // Clean up on error
      const execDir = path.join(this.tempDir, executionId);
      await fs.remove(execDir).catch(() => {});

      return {
        executionId,
        status: 'error',
        output: '',
        error: error.message,
        executionTime: 0,
        memoryUsed: 0,
        language,
        timestamp: new Date().toISOString()
      };
    }
  }

  async submitSolution({ code, language, problemId, testCases, timeLimit = 10 }) {
    const submissionId = uuidv4();
    
    try {
      this.logger.info(`Starting solution submission: ${submissionId}`, {
        problemId,
        language,
        testCasesCount: testCases.length
      });

      const results = {
        submissionId,
        problemId,
        language,
        status: 'pending',
        totalTestCases: testCases.length,
        passedTestCases: 0,
        failedTestCases: 0,
        testCaseResults: [],
        overallResult: 'pending',
        executionTime: 0,
        memoryUsed: 0,
        timestamp: new Date().toISOString()
      };

      let totalExecutionTime = 0;

      // Execute code against each test case
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        
        try {
          const execution = await this.executeCode({
            code,
            language,
            input: testCase.input,
            timeLimit
          });

          const isCorrect = this.compareOutputs(
            execution.output.trim(),
            testCase.expectedOutput.trim()
          );

          const testResult = {
            testCaseNumber: i + 1,
            status: execution.status === 'success' ? (isCorrect ? 'passed' : 'failed') : 'error',
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: execution.output.trim(),
            executionTime: execution.executionTime,
            memoryUsed: execution.memoryUsed,
            error: execution.error
          };

          if (testResult.status === 'passed') {
            results.passedTestCases++;
          } else {
            results.failedTestCases++;
          }

          results.testCaseResults.push(testResult);
          totalExecutionTime += execution.executionTime;

        } catch (error) {
          results.failedTestCases++;
          results.testCaseResults.push({
            testCaseNumber: i + 1,
            status: 'error',
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: '',
            executionTime: 0,
            memoryUsed: 0,
            error: error.message
          });
        }
      }

      // Determine overall result
      if (results.passedTestCases === results.totalTestCases) {
        results.overallResult = 'accepted';
        results.status = 'completed';
      } else if (results.failedTestCases > 0) {
        results.overallResult = 'wrong_answer';
        results.status = 'completed';
      } else {
        results.overallResult = 'runtime_error';
        results.status = 'completed';
      }

      results.executionTime = totalExecutionTime;

      return results;

    } catch (error) {
      this.logger.error(`Solution submission failed: ${submissionId}`, {
        error: error.message,
        problemId
      });

      return {
        submissionId,
        problemId,
        language,
        status: 'error',
        overallResult: 'compilation_error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Submit solution using function-based approach (LeetCode style)
   * @param {Object} params - Parameters object
   * @param {string} params.code - User's function code
   * @param {string} params.language - Programming language
   * @param {string} params.problemId - Problem identifier
   * @param {Array} params.testCases - Array of test cases
   * @param {number} params.timeLimit - Time limit in seconds
   * @returns {Object} Submission results
   */
  async submitFunctionSolution({ code, language, problemId, testCases, timeLimit = 10 }) {
    const submissionId = uuidv4();
    
    try {
      this.logger.info(`Starting function-based solution submission: ${submissionId}`, {
        problemId,
        language,
        testCasesCount: testCases.length
      });

      // Extract function template from user code
      const functionTemplate = this.functionWrapper.extractFunctionTemplate(code, language);
      
      // Wrap user function with test execution logic
      const wrappedCode = this.functionWrapper.wrapFunctionWithTests({
        code,
        language,
        testCases,
        functionTemplate
      });

      // Execute the wrapped code
      const execution = await this.executeCode({
        code: wrappedCode,
        language,
        input: '',
        timeLimit
      });

      // Parse test results from output
      const results = this.parseTestResults(execution, testCases, submissionId, problemId, language);
      
      return results;

    } catch (error) {
      this.logger.error(`Function-based solution submission failed: ${submissionId}`, {
        error: error.message,
        problemId
      });

      return {
        submissionId,
        problemId,
        language,
        status: 'error',
        overallResult: 'compilation_error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Parse test results from wrapped function execution output
   */
  parseTestResults(execution, testCases, submissionId, problemId, language) {
    const results = {
      submissionId,
      problemId,
      language,
      status: 'completed',
      totalTestCases: testCases.length,
      passedTestCases: 0,
      failedTestCases: 0,
      testCaseResults: [],
      overallResult: 'pending',
      executionTime: execution.executionTime || 0,
      memoryUsed: 0,
      timestamp: new Date().toISOString()
    };

    if (execution.status === 'error') {
      results.status = 'error';
      results.overallResult = 'runtime_error';
      results.error = execution.error;
      return results;
    }

    const output = execution.output || '';
    const lines = output.split('\n');
    
    // Look for TEST_RESULTS line
    const testResultsLine = lines.find(line => line.startsWith('TEST_RESULTS:'));
    if (testResultsLine) {
      const match = testResultsLine.match(/TEST_RESULTS:\s*(\d+)\/(\d+)/);
      if (match) {
        results.passedTestCases = parseInt(match[1]);
        results.totalTestCases = parseInt(match[2]);
        results.failedTestCases = results.totalTestCases - results.passedTestCases;
      }
    }

    // Parse individual test results
    let currentTestCase = null;
    const testCaseResults = [];
    
    for (const line of lines) {
      const testMatch = line.match(/Test (\d+): (PASS|FAIL)/);
      if (testMatch) {
        if (currentTestCase) {
          testCaseResults.push(currentTestCase);
        }
        
        const testNum = parseInt(testMatch[1]);
        const status = testMatch[2] === 'PASS' ? 'passed' : 'failed';
        
        currentTestCase = {
          testCaseNumber: testNum,
          status,
          input: testCases[testNum - 1]?.input || '',
          expectedOutput: testCases[testNum - 1]?.expectedOutput || '',
          actualOutput: '',
          executionTime: 0,
          memoryUsed: 0,
          passed: status === 'passed'
        };
      } else if (currentTestCase && line.trim().startsWith('Input:')) {
        currentTestCase.input = line.replace('Input:', '').trim();
      } else if (currentTestCase && line.trim().startsWith('Expected:')) {
        currentTestCase.expectedOutput = line.replace('Expected:', '').trim();
      } else if (currentTestCase && line.trim().startsWith('Actual:')) {
        currentTestCase.actualOutput = line.replace('Actual:', '').trim();
      } else if (currentTestCase && line.trim().startsWith('Error:')) {
        currentTestCase.error = line.replace('Error:', '').trim();
      }
    }
    
    if (currentTestCase) {
      testCaseResults.push(currentTestCase);
    }

    results.testCaseResults = testCaseResults;

    // Determine overall result
    if (results.passedTestCases === results.totalTestCases) {
      results.overallResult = 'accepted';
    } else if (results.failedTestCases > 0) {
      results.overallResult = 'wrong_answer';
    } else {
      results.overallResult = 'runtime_error';
    }

    return results;
  }

  buildRunArgs(language, fileName, execDir) {
    switch (language) {
      case 'javascript':
        return {
          command: 'node',
          args: [fileName]
        };
      
      case 'python':
        return {
          command: 'python',
          args: [fileName]
        };
      
      case 'java':
        return {
          command: 'java',
          args: ['Main']
        };
      
      case 'cpp':
        const cppExe = process.platform === 'win32' ? 'main.exe' : './main';
        return {
          command: cppExe,
          args: []
        };
      
      case 'c':
        const cExe = process.platform === 'win32' ? 'main.exe' : './main';
        return {
          command: cExe,
          args: []
        };
      
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  async runCommand(command, args, cwd, timeout, input = '') {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const process = spawn(command, args, {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        process.kill('SIGKILL');
      }, timeout);

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        clearTimeout(timer);
        const executionTime = Date.now() - startTime;

        if (timedOut) {
          resolve({
            stdout: '',
            stderr: 'Time Limit Exceeded',
            executionTime,
            error: 'Time Limit Exceeded'
          });
        } else if (code !== 0 && !stdout && stderr) {
          resolve({
            stdout: '',
            stderr,
            executionTime,
            error: stderr
          });
        } else {
          resolve({
            stdout,
            stderr,
            executionTime,
            error: null
          });
        }
      });

      process.on('error', (error) => {
        clearTimeout(timer);
        const executionTime = Date.now() - startTime;
        
        // Special handling for missing compilers
        if (error.code === 'ENOENT') {
          let errorMessage = error.message;
          if (command.includes('g++')) {
            errorMessage = 'C++ compiler (g++) is not installed. Please install MinGW-w64 or Visual Studio Build Tools to compile C++ code.';
          } else if (command.includes('gcc')) {
            errorMessage = 'C compiler (gcc) is not installed. Please install MinGW-w64 or Visual Studio Build Tools to compile C code.';
          } else if (command.includes('javac')) {
            errorMessage = 'Java compiler (javac) is not installed. Please install Java Development Kit (JDK).';
          } else if (command.includes('python')) {
            errorMessage = 'Python is not installed or not in PATH. Please install Python and add it to your system PATH.';
          } else if (command.includes('node')) {
            errorMessage = 'Node.js is not installed or not in PATH. Please install Node.js and add it to your system PATH.';
          }
          
          resolve({
            stdout: '',
            stderr: errorMessage,
            executionTime,
            error: errorMessage
          });
        } else {
          resolve({
            stdout: '',
            stderr: error.message,
            executionTime,
            error: error.message
          });
        }
      });

      // Write input if provided
      if (input) {
        process.stdin.write(input);
      }
      process.stdin.end();
    });
  }

  compareOutputs(actual, expected) {
    // Normalize whitespace and line endings
    const normalizeOutput = (output) => {
      return output
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim()
        .replace(/\s+$/gm, ''); // Remove trailing whitespace from each line
    };

    return normalizeOutput(actual) === normalizeOutput(expected);
  }

  updateLanguageStats(language) {
    if (!this.executionStats.languageStats[language]) {
      this.executionStats.languageStats[language] = {
        total: 0,
        successful: 0,
        failed: 0
      };
    }
    this.executionStats.languageStats[language].total++;
  }

  async getExecutionStats() {
    return {
      ...this.executionStats,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = SimpleCompilerService;
