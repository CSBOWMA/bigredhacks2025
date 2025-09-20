package v1

import (
	"github.com/gin-gonic/gin"
	"github.com/CSBOWMA/bigredhacks2025/gin/internal/api/v1/handlers"
	"github.com/CSBOWMA/bigredhacks2025/gin/internal/api/v1/middleware"

)

// RegisterRoutes attaches all v1 endpoints to the supplied router group.
func RegisterRoutes(rg *gin.RouterGroup) {
	// Existing routes (e.g. health, maybe protected ones) can stay here ...

	// ----- Auth routes -----
	auth := rg.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
auth.POST("/login", handlers.Login)
	}

	// Example protected group using the session middleware
	protected := rg.Group("/protected")
	protected.Use(middleware.SessionCheck())
	{
		// You can add any handler that needs an authenticated user.
		// For demo, we expose a simple endpoint that echoes the userID.
		protected.GET("/profile", func(c *gin.Context) {
			userID, _ := c.Get("userID")
			c.JSON(200, gin.H{"message": "you are authorized", "user_id": userID})
		})
	}
}
