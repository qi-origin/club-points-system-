# ─── Stage 1: Build frontend ─────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ─── Stage 2: Build backend ──────────────────────────────
FROM node:20-alpine AS backend-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npx prisma generate
RUN npm run build

# ─── Stage 3: Production runtime ─────────────────────────
FROM node:20-alpine
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy backend
COPY --from=backend-builder /app/server/dist ./server/dist
COPY --from=backend-builder /app/server/node_modules ./server/node_modules
COPY --from=backend-builder /app/server/package.json ./server/
COPY --from=backend-builder /app/server/prisma ./server/prisma

# Copy frontend build
COPY --from=frontend-builder /app/client/dist ./client/dist

# Create uploads and data directories
RUN mkdir -p /app/server/uploads /app/data

WORKDIR /app/server

# Run migrations and seed, then start
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"]
