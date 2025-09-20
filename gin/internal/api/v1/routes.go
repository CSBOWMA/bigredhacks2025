package v1

import (
    "github.com/gin-gonic/gin"
)

// RegisterRoutes attaches all v1 handlers to the provided gin.RouterGroup
func RegisterRoutes(rg *gin.RouterGroup) {
    // Sub‑group for users (you can keep adding more groups)
    userGroup := rg.Group("/users")
    {
        userGroup.GET("/", GetUsers)           // GET /api/v1/users
        userGroup.POST("/", CreateUser)        // POST /api/v1/users
        userGroup.GET("/:id", GetUserByID)     // GET /api/v1/users/:id
        userGroup.PUT("/:id", UpdateUser)      // PUT /api/v1/users/:id
        userGroup.DELETE("/:id", DeleteUser)   // DELETE /api/v1/users/:id
    }

    // Example of a health check endpoint
    rg.GET("/healthz", HealthCheck)
}
