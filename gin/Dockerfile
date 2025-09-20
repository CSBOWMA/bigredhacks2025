# --------------------------------------------------------------
# Stage 1 – Development image (includes the Gin hot‑reloader)
# --------------------------------------------------------------
FROM golang:1.25-alpine AS dev

# Install tools needed for the build and for the Gin CLI
# git is required for go mod download, gcc & musl-dev for cgo (if you use it)
RUN apk add --no-cache git gcc musl-dev

# Set the working directory inside the container
WORKDIR /app

# -----------------------------------------------------------------
# Cache Go modules – copy only go.mod/go.sum first, then download.
# This layer is cached as long as those files don't change.
# -----------------------------------------------------------------
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code (this layer will be re‑built on every change)
COPY . .

# Expose the port that Gin will listen on (default for Gin is 8080)
EXPOSE 8080

# -----------------------------------------------------------------
# Default command for the dev image:
#   gin runs the app with automatic recompilation on file changes.
#   The "--port" flag makes sure we bind to the same port we expose.
# -----------------------------------------------------------------
CMD ["gin", "run", "--port", "8080"]

# --------------------------------------------------------------
# Stage 2 – Builder (produces a static binary)
# --------------------------------------------------------------
FROM dev AS builder

# Build a static, fully‑optimized binary for Linux.
# CGO_ENABLED=0 makes the binary 100% static (no external glibc).
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server .

# --------------------------------------------------------------
# Stage 3 – Production image (scratch, ~5‑10 MB)
# --------------------------------------------------------------
FROM alpine:latest AS prod

# Copy only the compiled binary from the builder stage.
COPY --from=builder /app/server /server

# Keep the same port exposed for production.
EXPOSE 8080

# Run the binary.
CMD ["/server"]
