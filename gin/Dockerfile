
FROM golang:1.24.2

# Set destination for COPY
WORKDIR /app

# Download Go modules
COPY . ./

# CopyVcV the source code. Note the slash at the end, as explained in
# https://docs.docker.com/reference/dockerfile/#copy
COPY . ./

# Build
RUN go mod tidy
RUN CGO_ENABLED=1 GOOS=linux go build ./cmd/server -o /docker-gs-ping

# Optional:
# To bind to a TCP port, runtime parameters must be supplied to the docker command.
# But we can document in the Dockerfile what ports
# the application is going to listen on by default.
# https://docs.docker.com/reference/dockerfile/#expose
EXPOSE 8080

# Run
CMD ["/docker-gs-ping"]
