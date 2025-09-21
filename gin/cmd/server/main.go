package main

import (
	"log"
	"net/http"
	"github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
    "github.com/CSBOWMA/bigredhacks2025/gin/internal/api/v1"
    "github.com/CSBOWMA/bigredhacks2025/gin/internal/db"
    "github.com/CSBOWMA/bigredhacks2025/gin/internal/config" 
)

func main() {
	// -----------------------------------------------------------------
	// 1️⃣ Load .env (populates os.Environ for the rest of the code)
	// -----------------------------------------------------------------
	env := config.Load()

	// -----------------------------------------------------------------
	// 2️⃣ Connect to MongoDB Atlas
	// -----------------------------------------------------------------
	mongoURI := env["MONGODB_URI"]
	if mongoURI == "" {
		log.Fatal("� MONGODB_URI not set in .env")
	}
	if err := db.Connect(mongoURI); err != nil {
		log.Fatalf("� failed to connect to MongoDB: %v", err)
	}
	defer db.Close()

	// -----------------------------------------------------------------
	// 3️⃣ Gin router – minimal middleware for a hackathon
	// -----------------------------------------------------------------
	r := gin.New()
	r.Use(gin.Recovery()) // recover from panics

      r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"*"},                 // <-- allow any origin
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Session-ID"},
        ExposeHeaders:    []string{""},
        AllowCredentials: true,
    }))

	// -----------------------------------------------------------------
	// 4️⃣ Register the v1 routes (handlers use db.DB() internally)
	// -----------------------------------------------------------------
	apiGroup := r.Group("/api/v1")
	v1.RegisterRoutes(apiGroup)

	// -----------------------------------------------------------------
	// 5️⃣ Simple health endpoint (useful for Docker/K8s)
	// -----------------------------------------------------------------
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// -----------------------------------------------------------------
	// 6️⃣ Start the HTTP server
	// -----------------------------------------------------------------
	port := env["PORT"]
	if port == "" {
		port = "8080"
	}
	log.Printf("� Server listening on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("� server crashed: %v", err)
	}
}
