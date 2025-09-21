package v1

import (
	"github.com/gin-gonic/gin"
	"github.com/CSBOWMA/bigredhacks2025/gin/internal/api/v1/handlers"
	"github.com/CSBOWMA/bigredhacks2025/gin/internal/api/v1/middleware"
)

func RegisterRoutes(rg *gin.RouterGroup) {
	// Public auth routes
	auth := rg.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
	}

	// Protected routes (session required)
	protected := rg.Group("/")
	protected.Use(middleware.SessionCheck())
	{
		// Example profile endpoint (already there)
		protected.GET("/protected/profile", func(c *gin.Context) {
			userID, _ := c.Get("userID")
			c.JSON(200, gin.H{"message": "you are authorized", "user_id": userID})
		})

		// ----- Stream key routes -----
		stream := protected.Group("/stream-key")
		{
			stream.GET("", handlers.GetStreamKey)
			stream.POST("/new", handlers.NewStreamKey)
		}
	}
}
