# Use Ubuntu as base image for better compiler support
FROM ubuntu:22.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js, compilers, and other dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    gcc \
    g++ \
    openjdk-17-jdk \
    python3 \
    python3-pip \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create temp directory for code execution with proper permissions
RUN mkdir -p temp logs \
    && chmod 755 temp logs

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash --uid 1001 compiler \
    && chown -R compiler:compiler /app

# Switch to non-root user
USER compiler

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5001/health || exit 1

# Start the service
CMD ["npm", "start"]
