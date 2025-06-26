const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

/**
 * Language configuration object that defines compilation and execution commands
 * for different programming languages supported by the Online Judge
 */
const LANGUAGE_CONFIG = {
  c: {
    extension: '.c',
    compileCommand: 'gcc',
    compileArgs: ['-o'],
    runCommand: null, // Will be set to the compiled executable path
    needsCompilation: true,
    timeoutMs: 5000
  },
  cpp: {
    extension: '.cpp',
    compileCommand: 'g++',
    compileArgs: ['-o'],
    runCommand: null, // Will be set to the compiled executable path
    needsCompilation: true,
    timeoutMs: 5000
  },
  python: {
    extension: '.py',
    compileCommand: null,
    compileArgs: [],
    runCommand: 'python',
    runArgs: [],
    needsCompilation: false,
    timeoutMs: 5000
  },
  javascript: {
    extension: '.js',
    compileCommand: null,
    compileArgs: [],
    runCommand: 'node',
    runArgs: [],
    needsCompilation: false,
    timeoutMs: 5000
  }
};

/**
 * Execution result status constants
 */
const EXECUTION_STATUS = {
  SUCCESS: 'Success',
  COMPILE_ERROR: 'Compile Error',
  RUNTIME_ERROR: 'Runtime Error',
  TIME_LIMIT_EXCEEDED: 'Time Limit Exceeded',
  MEMORY_LIMIT_EXCEEDED: 'Memory Limit Exceeded',
  WRONG_ANSWER: 'Wrong Answer',
  ACCEPTED: 'Accepted'
};

/**
 * Main CodeRunner class that handles code compilation and execution
 */
class CodeRunner {
  constructor() {
    this.tempDir = path.join(__dirname, 'temp');
    this.ensureTempDirectory();
  }

  /**
   * Ensures that the temporary directory exists for storing code files
   */
  async ensureTempDirectory() {
    try {
      await fs.access(this.tempDir);
    } catch (error) {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  /**
   * Generates a unique filename for temporary code files
   * @param {string} extension - File extension for the language
   * @returns {string} Unique filename with path
   */
  generateTempFilename(extension) {
    const uniqueId = uuidv4();
    return path.join(this.tempDir, `code_${uniqueId}${extension}`);
  }
  /**
   * Writes the source code to a temporary file
   * @param {string} code - Source code to write
   * @param {string} filename - Path where to write the file
   */
  async writeCodeToFile(code, filename) {
    // Ensure directory exists before writing file
    const dir = path.dirname(filename);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filename, code, 'utf8');
  }

  /**
   * Compiles the source code if compilation is needed for the language
   * @param {string} sourceFile - Path to the source file
   * @param {string} language - Programming language
   * @returns {Object} Compilation result with status and details
   */
  async compileCode(sourceFile, language) {
    const config = LANGUAGE_CONFIG[language];
    
    // If language doesn't need compilation, return success
    if (!config.needsCompilation) {
      return {
        success: true,
        executablePath: sourceFile,
        stderr: '',
        stdout: ''
      };
    }

    // Generate executable path (remove extension and add .exe for Windows)
    const executablePath = sourceFile.replace(path.extname(sourceFile), '') + 
                          (process.platform === 'win32' ? '.exe' : '');

    // Prepare compilation command and arguments
    const compileArgs = [...config.compileArgs, executablePath, sourceFile];

    return new Promise((resolve) => {
      const startTime = Date.now();
      
      // Spawn the compilation process
      const compileProcess = spawn(config.compileCommand, compileArgs, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      // Capture stdout from compilation
      compileProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      // Capture stderr from compilation (usually contains error messages)
      compileProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // Handle compilation completion
      compileProcess.on('close', (code) => {
        const compilationTime = Date.now() - startTime;
        
        resolve({
          success: code === 0,
          executablePath: code === 0 ? executablePath : null,
          stderr,
          stdout,
          exitCode: code,
          compilationTime
        });
      });

      // Handle compilation errors (e.g., compiler not found)
      compileProcess.on('error', (error) => {
        resolve({
          success: false,
          executablePath: null,
          stderr: `Compilation error: ${error.message}`,
          stdout: '',
          exitCode: -1,
          compilationTime: Date.now() - startTime
        });
      });
    });
  }

  /**
   * Executes the compiled code or interprets the source code
   * @param {string} executablePath - Path to executable or source file
   * @param {string} language - Programming language
   * @param {string} stdin - Input to provide to the program
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {Object} Execution result with output and timing information
   */
  async executeCode(executablePath, language, stdin = '', timeoutMs = 5000) {
    const config = LANGUAGE_CONFIG[language];
    
    // Determine command and arguments based on language
    let command, args;
    if (config.needsCompilation) {
      // For compiled languages, run the executable directly
      command = executablePath;
      args = [];
    } else {
      // For interpreted languages, use the interpreter
      command = config.runCommand;
      args = [executablePath];
    }

    return new Promise((resolve) => {
      const startTime = Date.now();
      let isTimedOut = false;
      
      // Spawn the execution process
      const executeProcess = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      // Set up timeout mechanism
      const timeoutId = setTimeout(() => {
        isTimedOut = true;
        executeProcess.kill('SIGKILL'); // Force kill the process
      }, timeoutMs);

      // Capture stdout from execution
      executeProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      // Capture stderr from execution
      executeProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // Handle execution completion
      executeProcess.on('close', (code) => {
        clearTimeout(timeoutId);
        const executionTime = Date.now() - startTime;

        if (isTimedOut) {
          resolve({
            status: EXECUTION_STATUS.TIME_LIMIT_EXCEEDED,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode: -1,
            executionTime,
            memoryUsed: 0 // TODO: Implement memory tracking
          });
        } else if (code !== 0) {
          resolve({
            status: EXECUTION_STATUS.RUNTIME_ERROR,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode: code,
            executionTime,
            memoryUsed: 0
          });
        } else {
          resolve({
            status: EXECUTION_STATUS.SUCCESS,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode: code,
            executionTime,
            memoryUsed: 0
          });
        }
      });

      // Handle execution errors (e.g., executable not found)
      executeProcess.on('error', (error) => {
        clearTimeout(timeoutId);
        const executionTime = Date.now() - startTime;
        
        resolve({
          status: EXECUTION_STATUS.RUNTIME_ERROR,
          stdout: stdout.trim(),
          stderr: `Execution error: ${error.message}`,
          exitCode: -1,
          executionTime,
          memoryUsed: 0
        });
      });

      // Provide stdin to the process if available
      if (stdin) {
        executeProcess.stdin.write(stdin);
      }
      executeProcess.stdin.end();
    });
  }

  /**
   * Cleans up temporary files created during compilation and execution
   * @param {Array<string>} filePaths - Array of file paths to delete
   */
  async cleanupFiles(filePaths) {
    const deletePromises = filePaths.map(async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // Ignore errors if file doesn't exist or can't be deleted
        console.warn(`Warning: Could not delete file ${filePath}:`, error.message);
      }
    });

    await Promise.allSettled(deletePromises);
  }

  /**
   * Main method to run code - handles the complete pipeline from source to result
   * @param {string} code - Source code to execute
   * @param {string} language - Programming language (c, cpp, python, javascript)
   * @param {string} stdin - Input to provide to the program (optional)
   * @returns {Object} Complete execution result
   */
  async runCode(code, language, stdin = '') {
    // Validate language support
    if (!LANGUAGE_CONFIG[language]) {
      return {
        status: EXECUTION_STATUS.RUNTIME_ERROR,
        error: `Unsupported language: ${language}`,
        stdout: '',
        stderr: '',
        executionTime: 0,
        compilationTime: 0
      };
    }

    const config = LANGUAGE_CONFIG[language];
    const sourceFile = this.generateTempFilename(config.extension);
    const filesToCleanup = [sourceFile];

    try {
      // Step 1: Write source code to temporary file
      await this.writeCodeToFile(code, sourceFile);

      // Step 2: Compile the code (if needed)
      const compileResult = await this.compileCode(sourceFile, language);
      
      if (!compileResult.success) {
        // Compilation failed
        await this.cleanupFiles(filesToCleanup);
        return {
          status: EXECUTION_STATUS.COMPILE_ERROR,
          error: 'Compilation failed',
          stdout: compileResult.stdout,
          stderr: compileResult.stderr,
          executionTime: 0,
          compilationTime: compileResult.compilationTime || 0
        };
      }

      // Add executable to cleanup list if it was created
      if (compileResult.executablePath && compileResult.executablePath !== sourceFile) {
        filesToCleanup.push(compileResult.executablePath);
      }

      // Step 3: Execute the code
      const executeResult = await this.executeCode(
        compileResult.executablePath,
        language,
        stdin,
        config.timeoutMs
      );

      // Step 4: Cleanup temporary files
      await this.cleanupFiles(filesToCleanup);

      // Step 5: Return complete result
      return {
        ...executeResult,
        compilationTime: compileResult.compilationTime || 0
      };

    } catch (error) {
      // Handle any unexpected errors
      await this.cleanupFiles(filesToCleanup);
      return {
        status: EXECUTION_STATUS.RUNTIME_ERROR,
        error: `Unexpected error: ${error.message}`,
        stdout: '',
        stderr: error.message,
        executionTime: 0,
        compilationTime: 0
      };
    }
  }

  /**
   * Runs code against multiple test cases (for submit functionality)
   * @param {string} code - Source code to test
   * @param {string} language - Programming language
   * @param {Array} testCases - Array of test case objects with input and expectedOutput
   * @returns {Object} Results for all test cases with overall verdict
   */
  async runTests(code, language, testCases) {
    const results = [];
    let overallStatus = EXECUTION_STATUS.ACCEPTED;
    let totalExecutionTime = 0;
    let compilationTime = 0;

    // Validate inputs
    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      return {
        status: EXECUTION_STATUS.RUNTIME_ERROR,
        error: 'No test cases provided',
        results: [],
        totalExecutionTime: 0,
        compilationTime: 0
      };
    }

    // For efficiency, compile once and reuse for all test cases
    if (!LANGUAGE_CONFIG[language]) {
      return {
        status: EXECUTION_STATUS.RUNTIME_ERROR,
        error: `Unsupported language: ${language}`,
        results: [],
        totalExecutionTime: 0,
        compilationTime: 0
      };
    }

    const config = LANGUAGE_CONFIG[language];
    const sourceFile = this.generateTempFilename(config.extension);
    const filesToCleanup = [sourceFile];

    try {
      // Write and compile code once
      await this.writeCodeToFile(code, sourceFile);
      const compileResult = await this.compileCode(sourceFile, language);
      compilationTime = compileResult.compilationTime || 0;

      if (!compileResult.success) {
        await this.cleanupFiles(filesToCleanup);
        return {
          status: EXECUTION_STATUS.COMPILE_ERROR,
          error: 'Compilation failed',
          stderr: compileResult.stderr,
          results: [],
          totalExecutionTime: 0,
          compilationTime
        };
      }

      if (compileResult.executablePath && compileResult.executablePath !== sourceFile) {
        filesToCleanup.push(compileResult.executablePath);
      }

      // Run each test case
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const executeResult = await this.executeCode(
          compileResult.executablePath,
          language,
          testCase.input || '',
          config.timeoutMs
        );

        totalExecutionTime += executeResult.executionTime;

        // Determine test case result
        let testStatus;
        if (executeResult.status === EXECUTION_STATUS.SUCCESS) {
          // Compare output with expected result
          const actualOutput = executeResult.stdout.trim();
          const expectedOutput = (testCase.expectedOutput || '').trim();
          
          if (actualOutput === expectedOutput) {
            testStatus = EXECUTION_STATUS.ACCEPTED;
          } else {
            testStatus = EXECUTION_STATUS.WRONG_ANSWER;
            overallStatus = EXECUTION_STATUS.WRONG_ANSWER;
          }
        } else {
          // Runtime error, TLE, etc.
          testStatus = executeResult.status;
          overallStatus = executeResult.status;
        }

        results.push({
          testCase: i + 1,
          status: testStatus,
          input: testCase.input || '',
          expectedOutput: testCase.expectedOutput || '',
          actualOutput: executeResult.stdout,
          stderr: executeResult.stderr,
          executionTime: executeResult.executionTime,
          exitCode: executeResult.exitCode
        });

        // Stop on first failure for efficiency (can be made configurable)
        if (testStatus !== EXECUTION_STATUS.ACCEPTED) {
          break;
        }
      }

      await this.cleanupFiles(filesToCleanup);

      return {
        status: overallStatus,
        results,
        totalExecutionTime,
        compilationTime,
        passedTests: results.filter(r => r.status === EXECUTION_STATUS.ACCEPTED).length,
        totalTests: testCases.length
      };

    } catch (error) {
      await this.cleanupFiles(filesToCleanup);
      return {
        status: EXECUTION_STATUS.RUNTIME_ERROR,
        error: `Unexpected error: ${error.message}`,
        results: [],
        totalExecutionTime,
        compilationTime
      };
    }
  }
}

module.exports = {
  CodeRunner,
  EXECUTION_STATUS,
  LANGUAGE_CONFIG
};
