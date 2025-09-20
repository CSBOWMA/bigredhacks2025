# ---------- Build & Runtime (single stage) ----------
FROM golang:1.22-alpine AS builder

# Install only what we need for a clean build
RUN apk add --no-cache git ca-certificates bash

# Working directory inside the container
WORKDIR /src

# -------------------------------------------------
# 1️⃣  Cache Go modules (including vendor)
# -------------------------------------------------
COPY go.mod go.sum ./
RUN go mod download && go mod vendor   # <-- creates ./vendor

# -------------------------------------------------
# 2️⃣  Copy the rest of the source code
# -------------------------------------------------
COPY . .

# -------------------------------------------------
# 3️⃣  Build the binary using the vendor directory
# -------------------------------------------------
RUN CGO_ENABLED=0 GOOS=linux go build \
    -mod=vendor \
    -ldflags="-s -w" \
    -o /src/bin/gin-app \
    ./cmd/server   # <-- adjust if your main package is elsewhere

# -------------------------------------------------
# 4️⃣  Create the folder for the SQLite DB and an empty file
# -------------------------------------------------
RUN mkdir -p /data && \
    touch /data/stream.db && \
    chmod 666 /data/stream.db

# -------------------------------------------------
# 5️⃣  Expose the Gin port (default 8080)
# -------------------------------------------------
EXPOSE 8080

# -------------------------------------------------
# 6️⃣  Run the binary
# -------------------------------------------------
ENTRYPOINT ["/src/bin/gin-app"]
