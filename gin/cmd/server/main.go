package main

import (
    "github.com/CSBOWMA/bigredhacks2025/gin/internal/api/v1"
	"github.com/gin-gonic/gin"
    "github.com/CSBOWMA/bigredhacks2025/gin/internal/db"

)

func main() {
    // Initialise the DB (in a real app you would read the DSN from env)
    db.Init() // calls gorm.Open(...), AutoMigrate(&models.StreamKey{})

    r := gin.New()
    // Global middleware
    r.Use(gin.Recovery())          // recover from panics

    // API version 1
    apiV1 := r.Group("/api/v1")
    v1.RegisterRoutes(apiV1)       // calls the RegisterRoutes defined in internal/api/v1/routes.go

    // Health endpoint (useful for Docker/K8s liveness probes)
    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "ok"})
    })

    // Listen on port 8080 (the port we expose in Docker)
    if err := r.Run(":8080"); err != nil {
        panic(err)
    }
}
