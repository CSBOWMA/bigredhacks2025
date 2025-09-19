# ---------- 1️⃣ Build stage ----------
FROM node:20-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy only the files needed to install dependencies
# This leverages Docker's layer cache – dependencies are only re-installed
# when package.json or package-lock.json change.
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies needed for the build)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the Next.js app
# Next will automatically detect the "production" environment.
RUN npm run build

# ---------- 2️⃣ Runtime stage ----------
FROM node:20-alpine AS runtime

# Set a non-root user (optional but recommended for security)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy only the built artifacts and the production dependencies
# --from=builder copies from the previous stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./

# Install only production dependencies (no dev deps)
RUN npm ci --only=production

# Switch to the non-root user
USER nextjs

# Expose the port that the Next.js app will listen on (default 3000)
EXPOSE 3000

# The command that starts the app in production mode
CMD ["npm", "run", "start"]
