const express = require('express');
const { LANGUAGE_CONFIG } = require('../core/codeRunner');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

/**
 * Health Check Routes
 * 
 * These endpoints provide system health monitoring and status information
 * for the code execution server
 */

/**
 * GET /api/health
 * 
 * Basic health check endpoint
 */
router.get('/', asyncHandler(async (req, res) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      human: formatUptime(uptime)
    },
    memory: {
      used: Math.round(memory.heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(memory.heapTotal / 1024 / 1024 * 100) / 100,
      external: Math.round(memory.external / 1024 / 1024 * 100) / 100,
      unit: 'MB'
    },
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
}));

/**
 * GET /api/health/detailed
 * 
 * Detailed health check with system information
 */
router.get('/detailed', asyncHandler(async (req, res) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  // Check if temp directory is accessible
  const fs = require('fs').promises;
  const path = require('path');
  const tempDir = path.join(__dirname, '..', 'temp');
  
  let tempDirStatus = 'unknown';
  try {
    await fs.access(tempDir);
    tempDirStatus = 'accessible';
  } catch (error) {
    tempDirStatus = 'not accessible';
  }
  
  // Check supported languages
  const supportedLanguages = Object.keys(LANGUAGE_CONFIG);
  
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: {
      uptime: {
        seconds: Math.floor(uptime),
        human: formatUptime(uptime)
      },
      memory: {
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024 * 100) / 100,
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(memory.external / 1024 / 1024 * 100) / 100,
        rss: Math.round(memory.rss / 1024 / 1024 * 100) / 100,
        unit: 'MB'
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      pid: process.pid
    },
    codeExecution: {
      supportedLanguages,
      tempDirectory: {
        path: tempDir,
        status: tempDirStatus
      },
      defaultTimeout: 5000,
      maxTimeout: 10000
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3001
    }
  });
}));

/**
 * GET /api/health/compilers
 * 
 * Check availability of required compilers and interpreters
 */
router.get('/compilers', asyncHandler(async (req, res) => {
  const { spawn } = require('child_process');
  const compilerChecks = [];
  
  // Function to check if a command exists
  const checkCommand = (command, args = ['--version']) => {
    return new Promise((resolve) => {
      const process = spawn(command, args, { stdio: 'pipe' });
      
      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        output += data.toString();
      });
      
      process.on('close', (code) => {
        resolve({
          command,
          available: code === 0,
          version: output.split('\n')[0] || 'Unknown',
          exitCode: code
        });
      });
      
      process.on('error', () => {
        resolve({
          command,
          available: false,
          version: 'Not installed',
          exitCode: -1,
          error: 'Command not found'
        });
      });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        process.kill();
        resolve({
          command,
          available: false,
          version: 'Timeout',
          exitCode: -1,
          error: 'Check timed out'
        });
      }, 5000);
    });
  };
  
  // Check all required compilers/interpreters
  const checks = [
    checkCommand('gcc'),
    checkCommand('g++'),
    checkCommand('python', ['--version']),
    checkCommand('node', ['--version'])
  ];
  
  const results = await Promise.all(checks);
  
  // Categorize results
  const available = results.filter(r => r.available);
  const missing = results.filter(r => !r.available);
  
  res.json({
    success: true,
    status: missing.length === 0 ? 'all-available' : 'some-missing',
    timestamp: new Date().toISOString(),
    compilers: {
      available: available.map(r => ({
        name: r.command,
        version: r.version,
        status: 'available'
      })),
      missing: missing.map(r => ({
        name: r.command,
        status: 'missing',
        error: r.error || 'Not available'
      })),
      summary: {
        total: results.length,
        available: available.length,
        missing: missing.length
      }
    },
    recommendations: missing.length > 0 ? [
      'Install missing compilers/interpreters for full language support',
      missing.includes(results.find(r => r.command === 'gcc')) ? 'Install GCC for C support' : null,
      missing.includes(results.find(r => r.command === 'g++')) ? 'Install G++ for C++ support' : null,
      missing.includes(results.find(r => r.command === 'python')) ? 'Install Python for Python support' : null,
      missing.includes(results.find(r => r.command === 'node')) ? 'Install Node.js for JavaScript support' : null
    ].filter(Boolean) : ['All required compilers are available']
  });
}));

/**
 * GET /api/health/ping
 * 
 * Simple ping endpoint for load balancers
 */
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

/**
 * Helper function to format uptime in human readable format
 */
function formatUptime(uptime) {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);
  
  return parts.join(' ') || '0s';
}

module.exports = router;
