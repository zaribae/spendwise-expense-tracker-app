# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./

RUN npm cache clean --force

RUN npm install

# Copy source and build (if you have a build step like TypeScript)
COPY . .

RUN npm run build 

# Stage 2: Runner
FROM node:22-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./dist
# Note: If not using a build step, copy your source files directly

# Use non-root user for security
USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]