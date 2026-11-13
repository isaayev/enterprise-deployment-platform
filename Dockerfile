# =============================================================================
# Multi-stage Dockerfile for NexusGaming Review Platform (Next.js)
# =============================================================================
# Stage 1 (deps):    Install production dependencies
# Stage 2 (builder): Build the Next.js application
# Stage 3 (runner):  Minimal production image with standalone output
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Install dependencies
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Copy only package files first to leverage Docker layer caching —
# dependencies are only re-installed when package files change
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
# Stage 2: Build the application
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy installed node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application source code
COPY . .

# Disable Next.js telemetry during the build
ENV NEXT_TELEMETRY_DISABLED=1
ENV JWT_SECRET=build_time_secret_minimum_32_characters_for_precompilation
ENV ADMIN_EMAIL=admin@enterprise.gg
ENV ADMIN_USERNAME=NexusAdmin
ENV ADMIN_PASSWORD=build_time_admin_pass_12345678

# Build the Next.js application (produces .next/standalone output)
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: Production runner
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user for security — never run production containers as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the public assets from the builder stage
COPY --from=builder /app/public ./public

# Copy the standalone server output (includes server.js and required node_modules)
COPY --from=builder /app/.next/standalone ./

# Copy the static assets into the expected .next/static path
COPY --from=builder /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

# Expose the default Next.js port
EXPOSE 3000

# Set the port and hostname for the standalone server
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Start the standalone Next.js server
CMD ["node", "server.js"]
