# Multi-stage build for optimized Docker image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Use the standalone Next.js output. It includes only the traced runtime files,
# rather than a second full node_modules installation.
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Bound the V8 heap even when the image is started with `docker run` rather
# than the provided Compose file. Compose also caps the complete container.
ENV NODE_OPTIONS=--max-old-space-size=384

# Handle signals correctly when Docker stops or restarts the container.
RUN apk add --no-cache dumb-init

# Copy the self-contained production server and its static assets.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Expose port
EXPOSE 3000

# This must not hit `/`: that route runs Supabase session middleware and can
# leave health-check requests waiting on an unavailable external dependency.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http');const request=http.get('http://127.0.0.1:3000/health',response=>process.exit(response.statusCode===200?0:1));request.on('error',()=>process.exit(1));request.setTimeout(2000,()=>{request.destroy();process.exit(1)})"

# Run application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
