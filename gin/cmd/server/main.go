package main

import (
    "github.com/CSBOWMA/bigredhacks2025/gin/internal/api/v1"
	"github.com/gin-gonic/gin"
)

func main() {
    // Create the Gin engine
    r := gin.New()

    // Global middleware (logging, recovery, etc.)
    r.Use(gin.Recovery())                 // built‑in panic recovery

    // API version group
    apiV1 := r.Group("/api/v1")
    {
        v1.RegisterRoutes(apiV1) // calls the routes defined in internal/api/v1/routes.go
    }

    // Start the server (default 8080, change if you like)
    if err := r.Run(":8080"); err != nil {
        panic(err)
    }
}


