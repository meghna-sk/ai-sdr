# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Set default environment variable for API URL
ARG VITE_API_BASE_URL=https://ai-sdr-k9ml.onrender.com
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Install serve globally and wget for health check
RUN npm install -g serve && apk add --no-cache wget

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
# Install serve to run the built app
RUN npm install -g serve

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Serve the built application
CMD ["serve", "-s", "dist", "-l", "3000"]
