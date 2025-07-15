# Compiler Service

A Docker-based code execution service for the online judge platform.

## Features

- **Multi-language Support**: JavaScript, Python, Java, C++, C
- **Secure Execution**: Docker containers with resource limits
- **Test Case Validation**: Automated comparison of outputs
- **Performance Monitoring**: Execution time and memory usage tracking
- **Rate Limiting**: Protection against abuse
- **Comprehensive Logging**: Detailed execution logs

## Prerequisites

- Node.js 16+
- Docker Desktop
- At least 4GB RAM

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Pull required Docker images:
```bash
docker pull node:18-alpine
docker pull python:3.11-alpine
docker pull openjdk:17-alpine
docker pull gcc:latest
```

## Usage

### Start the service:
```bash
npm start
```

### Development mode:
```bash
npm run dev
```

## API Endpoints

### Execute Code
```bash
POST /api/compiler/execute
Content-Type: application/json

{
  "code": "console.log('Hello World');",
  "language": "javascript",
  "input": "",
  "timeLimit": 10
}
```

### Submit Solution
```bash
POST /api/compiler/submit
Content-Type: application/json

{
  "code": "console.log('Hello World');",
  "language": "javascript",
  "problemId": "problem123",
  "testCases": [
    {
      "input": "",
      "expectedOutput": "Hello World"
    }
  ],
  "timeLimit": 10
}
```

### Get Supported Languages
```bash
GET /api/compiler/languages
```

### Get Statistics
```bash
GET /api/compiler/stats
```

## Security

- Docker containers run with no network access
- Memory and CPU limits enforced
- Code execution timeouts
- File system isolation
- Rate limiting to prevent abuse

## Configuration

Environment variables in `.env`:

- `PORT`: Service port (default: 5001)
- `DOCKER_TIMEOUT`: Max execution time in ms
- `MEMORY_LIMIT`: Container memory limit
- `CPU_LIMIT`: Container CPU limit
- `RATE_LIMIT_WINDOW`: Rate limiting window
- `RATE_LIMIT_MAX`: Max requests per window

## Docker Images

The service uses these Docker images:
- `node:18-alpine` for JavaScript
- `python:3.11-alpine` for Python
- `openjdk:17-alpine` for Java
- `gcc:latest` for C/C++

## Troubleshooting

1. **Docker not found**: Ensure Docker Desktop is running
2. **Permission denied**: Check Docker daemon permissions
3. **Out of memory**: Increase Docker memory allocation
4. **Timeout errors**: Adjust `DOCKER_TIMEOUT` setting

## Architecture

```
compiler/
├── src/
│   ├── services/CompilerService.js    # Core execution logic
│   ├── routes/compiler.js             # API routes
│   ├── middleware/                    # Validation & error handling
│   └── server.js                      # Express server
├── temp/                              # Temporary execution files
├── logs/                              # Service logs
└── package.json
```
