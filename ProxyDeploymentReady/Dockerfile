# Ersa Training Frontend - Production Docker Image
# Configured with Proxy-based backend connection

FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy all necessary files
COPY .next ./.next
COPY public ./public
COPY messages ./messages
COPY locales ./locales
COPY next.config.js ./
COPY .env.production ./.env.production
COPY i18n.ts ./
COPY middleware.ts ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY next-env.d.ts ./

# Set environment to production
ENV NODE_ENV=production

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]

