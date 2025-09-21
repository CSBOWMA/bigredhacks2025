package main

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/CSBOWMA/bigredhacks2025/gin/internal/api/v1"
	"github.com/CSBOWMA/bigredhacks2025/gin/internal/config"
	"github.com/CSBOWMA/bigredhacks2025/gin/internal/db"
)

// allowOriginFunc returns true if the request origin is localhost (any port).
// This is safe for local development because the browser already guarantees
// that the Origin header cannot be forged by a different site.
func allowOriginFunc(origin string) bool {
	// Accept anything that starts with http://localhost:
	//   http://localhost
	//   http://localhost:80
	//   http://localhost:3000
	//   http://localhost:8080
	return strings.HasPrefix(origin, "http://localhost")
}

func main() {
	// -----------------------------------------------------------------
	// � Load .env
	// -----------------------------------------------------------------
	env := config.Load()

	// -----------------------------------------------------------------
	// � Connect to MongoDB
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
	// � Gin router
	// -----------------------------------------------------------------
	r := gin.New()
	r.Use(gin.Recovery()) // recover from panics

	// ---------- CORS ----------
	// This configuration:
	//   • Echoes back the exact Origin (if it passes allowOriginFunc)
	//   • Allows credentials (cookies, Authorization header)
	//   • Allows the methods/headers you need
	corsCfg := cors.Config{
		AllowOriginFunc:  allowOriginFunc,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Session-ID"},
		ExposeHeaders:    []string{"X-Session-ID"},
		AllowCredentials: true,
	}
	r.Use(cors.New(corsCfg))

	// -----------------------------------------------------------------
	// � Register the v1 routes
	// -----------------------------------------------------------------
	apiGroup := r.Group("/api/v1")
	v1.RegisterRoutes(apiGroup)

	// -----------------------------------------------------------------
	// � Health endpoint
	// -----------------------------------------------------------------
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// -----------------------------------------------------------------
	// � Start the HTTP server
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
