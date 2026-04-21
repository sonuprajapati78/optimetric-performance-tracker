# Build stage
FROM node:18-alpine as builder
WORKDIR /build
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Development stage
FROM node:18-alpine as development
WORKDIR /app

# Install dependencies
COPY --from=builder /build/node_modules ./node_modules
COPY package*.json ./
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Development command
CMD ["npm", "run", "dev"]

# Production stage
FROM node:18-alpine as production
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Install production dependencies only
COPY --from=builder /build/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY --from=builder /build . .

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Production command
CMD ["node", "src/app.js"]
