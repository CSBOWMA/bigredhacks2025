package v1

import "github.com/gin-gonic/gin"

// RegisterRoutes attaches all v1 handlers to the supplied router group.
func RegisterRoutes(rg *gin.RouterGroup) {
    // Create a new stream key (requires auth)
    rg.POST("/keys", CreateKey)

    // Issue a short‑lived JWT for HLS playback
    rg.POST("/tokens", IssueToken)

    // Nginx‑RTMP calls this on every publish attempt
    rg.GET("/validate-key", ValidateKey)

    // Nginx uses this to protect HLS endpoints
    rg.GET("/validate-token", ValidateToken)
}
