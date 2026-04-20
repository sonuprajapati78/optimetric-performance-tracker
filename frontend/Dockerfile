FROM node:18-alpine AS base
WORKDIR /app

# Development stage
FROM base AS development
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
ENV REACT_APP_API_URL=http://localhost:5000
CMD ["npm", "start"]

# Production stage - build
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
ENV REACT_APP_API_URL=https://optimetric-performance-tracker.onrender.com
RUN npm run build

# Production stage - serve
FROM node:18-alpine AS production
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/build ./build
EXPOSE 3000
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
CMD ["serve", "-s", "build", "-l", "3000"]
