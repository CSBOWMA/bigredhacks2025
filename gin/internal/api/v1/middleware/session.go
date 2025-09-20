package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/CSBOWMA/bigredhacks2025/gin/internal/service"
)

// SessionCheck extracts the session ID from the Authorization header
// (Bearer <sid>) or from a X-Session-ID header, validates it and puts the
// associated userID into the context (ctx.Keys["userID"]).
//
// Example usage:
//   protected := r.Group("/api/v1/protected")
//   protected.Use(middleware.SessionCheck())
//   protected.GET("/profile", handlers.GetProfile)
func SessionCheck() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Try to read the session id.
		var sid string

		// 1. Authorization: Bearer <sid>
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			// Expect "Bearer <token>"
			if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
				sid = authHeader[7:]
			}
		}

		// 2. Fallback to custom header X-Session-ID
		if sid == "" {
			sid = c.GetHeader("X-Session-ID")
		}

		// 3. (Optional) Cookie fallback – uncomment if you set a cookie.
		// if sid == "" {
		// 	sid, _ = c.Cookie("session_id")
		// }

		if sid == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing session id"})
			c.Abort()
			return
		}

		// Validate the session.
		sess, err := service.ValidateSession(c.Request.Context(), sid)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
			c.Abort()
			return
		}
		if sess == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired session"})
			c.Abort()
			return
		}

		// Store the user ID in the context for downstream handlers.
		c.Set("userID", sess.UserID)
		c.Next()
	}
}
