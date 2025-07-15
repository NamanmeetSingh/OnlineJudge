const Docker = require('dockerode');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

class CompilerService {
  constructor() {
    this.docker = new Docker();
    this.tempDir = path.join(__dirname, '..', '..', 'temp');
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
        image: 'node:18-alpine',
        fileExtension: '.js',
        compileCommand: null,
        runCommand: 'node',
        timeout: 10000
      },
      python: {
        image: 'python:3.11-alpine',
        fileExtension: '.py',
        compileCommand: null,
        runCommand: 'python',
        timeout: 10000
      },
      java: {
        image: 'openjdk:17-alpine',
        fileExtension: '.java',
        compileCommand: 'javac',
        runCommand: 'java',
        timeout: 15000,
        className: 'Main'
      },
      cpp: {
        image: 'gcc:latest',
        fileExtension: '.cpp',
        compileCommand: 'g++ -o output',
        runCommand: './output',
        timeout: 15000
      },
      c: {
        image: 'gcc:latest',
        fileExtension: '.c',
        compileCommand: 'gcc -o output',
        runCommand: './output',
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
    let container = null;

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

      // Create and start container
      const containerOptions = {
        Image: config.image,
        Cmd: await this.buildExecutionCommand(language, fileName),
        WorkingDir: '/workspace',
        HostConfig: {
          Memory: this.parseMemoryLimit(process.env.MEMORY_LIMIT || '128m'),
          CpuQuota: Math.floor((parseFloat(process.env.CPU_LIMIT) || 1.0) * 100000),
          CpuPeriod: 100000,
          NetworkMode: 'none',
          Binds: [`${execDir}:/workspace:rw`],
          AutoRemove: true
        },
        Env: [`TIMEOUT=${timeLimit}`],
        AttachStdout: true,
        AttachStderr: true
      };

      container = await this.docker.createContainer(containerOptions);
      
      const stream = await container.attach({
        stream: true,
        stdout: true,
        stderr: true
      });

      // Start container and set timeout
      await container.start();

      const result = await Promise.race([
        this.collectOutput(stream),
        this.createTimeoutPromise(timeLimit * 1000)
      ]);

      // Wait for container to finish
      await container.wait();

      // Clean up
      await fs.remove(execDir);

      const response = {
        executionId,
        status: result.error ? 'error' : 'success',
        output: result.stdout || '',
        error: result.stderr || result.error || '',
        executionTime: result.executionTime || 0,
        memoryUsed: result.memoryUsed || 0,
        language,
        timestamp: new Date().toISOString()
      };

      if (!result.error) {
        this.executionStats.successfulExecutions++;
      } else {
        this.executionStats.failedExecutions++;
      }

      this.logger.info(`Code execution completed: ${executionId}`, {
        status: response.status,
        executionTime: response.executionTime
      });

      return response;

    } catch (error) {
      this.executionStats.failedExecutions++;
      this.logger.error(`Code execution failed: ${executionId}`, {
        error: error.message,
        language
      });

      if (container) {
        try {
          await container.kill();
        } catch (killError) {
          this.logger.error(`Failed to kill container: ${killError.message}`);
        }
      }

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
      let maxMemoryUsed = 0;

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
          maxMemoryUsed = Math.max(maxMemoryUsed, execution.memoryUsed);

          // Stop on first failure for optimization (optional)
          if (testResult.status !== 'passed' && process.env.STOP_ON_FIRST_FAILURE === 'true') {
            break;
          }

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
      results.memoryUsed = maxMemoryUsed;

      this.logger.info(`Solution submission completed: ${submissionId}`, {
        overallResult: results.overallResult,
        passedTestCases: results.passedTestCases,
        totalTestCases: results.totalTestCases
      });

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

  async buildExecutionCommand(language, fileName) {
    const config = this.languageConfigs[language];
    
    switch (language) {
      case 'javascript':
        return ['sh', '-c', `cd /workspace && timeout $TIMEOUT node ${fileName} < input.txt`];
      
      case 'python':
        return ['sh', '-c', `cd /workspace && timeout $TIMEOUT python ${fileName} < input.txt`];
      
      case 'java':
        return ['sh', '-c', `cd /workspace && javac ${fileName} && timeout $TIMEOUT java Main < input.txt`];
      
      case 'cpp':
        return ['sh', '-c', `cd /workspace && g++ -o output ${fileName} && timeout $TIMEOUT ./output < input.txt`];
      
      case 'c':
        return ['sh', '-c', `cd /workspace && gcc -o output ${fileName} && timeout $TIMEOUT ./output < input.txt`];
      
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  async collectOutput(stream) {
    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      const startTime = Date.now();

      stream.on('data', (chunk) => {
        const data = chunk.toString();
        // Docker multiplexes stdout and stderr
        if (chunk[0] === 1) {
          stdout += data.slice(8);
        } else if (chunk[0] === 2) {
          stderr += data.slice(8);
        }
      });

      stream.on('end', () => {
        const executionTime = Date.now() - startTime;
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          executionTime,
          error: stderr.trim() ? stderr.trim() : null
        });
      });

      stream.on('error', (error) => {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          executionTime: Date.now() - startTime,
          error: error.message
        });
      });
    });
  }

  createTimeoutPromise(timeout) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Execution timed out after ${timeout}ms`));
      }, timeout);
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

  parseMemoryLimit(memoryLimit) {
    const units = {
      'b': 1,
      'k': 1024,
      'm': 1024 * 1024,
      'g': 1024 * 1024 * 1024
    };

    const match = memoryLimit.toLowerCase().match(/^(\d+)([bkmg]?)$/);
    if (!match) {
      return 128 * 1024 * 1024; // Default 128MB
    }

    const value = parseInt(match[1]);
    const unit = match[2] || 'b';
    return value * units[unit];
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

module.exports = CompilerService;
