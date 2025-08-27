# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for video processing
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S dacras -u 1001

# Create necessary directories
RUN mkdir -p uploads logs && \
    chown -R dacras:nodejs /app

# Copy application code
COPY --chown=dacras:nodejs . .

# Switch to non-root user
USER dacras

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]

# Labels for metadata
LABEL maintainer="BHT Labs <contact@bhtlabs.com>"
LABEL version="1.0.0"
LABEL description="Dacras AI Backend - Video Ad Generation API"
LABEL org.opencontainers.image.source="https://github.com/bht-labs/dacras-backend"