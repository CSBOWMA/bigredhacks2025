# ---------- Builder stage ----------
FROM golang:1.24.2-alpine AS builder

# Install git (required for any potential git‑based module proxy fallback)
RUN apk add --no-cache git ca-certificates

# Working directory inside the container
WORKDIR /src

# Copy everything we need for the build.
#   - go.mod, go.sum, vendor/ (already populated)
#   - source code (cmd, pkg, etc.)
COPY . .

# Sanity check: make sure vendor/ exists and is populated.

# Build the binary using the vendored modules only.
#   -mod=vendor forces the go tool to read from ./vendor
#   CGO_ENABLED=0 produces a static binary that runs on a scratch image.
#   -ldflags="-s -w" strips debug information to keep the image tiny.
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /app ./cmd/server

# ---------- Runtime stage ----------
# Use a minimal base image (no shell, no extra libraries)
FROM alpine:3.20 AS runtime

# Copy the compiled binary from the builder stage.
COPY --from=builder /app /app
COPY ./.env /.env

# (Optional) run as a non‑root user for extra safety.
# RUN adduser -D -g '' appuser
# USER appuser

ENTRYPOINT ["/app"]
