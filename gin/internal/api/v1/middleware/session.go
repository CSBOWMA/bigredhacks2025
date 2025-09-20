package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/CSBOWMA/bigredhacks2025/gin/internal/service"
)

// SessionCheck returns a handler that extracts the session ID from the request.
// It accepts any of the following:
//
//   - Authorization: Bearer <uuid>
//   - Authorization: <uuid>               (no "Bearer" word)
//   - X-Session-ID: <uuid>
//
// The extracted ID is stored in the context under the key "userID".
func SessionCheck() gin.HandlerFunc {
	return func(c *gin.Context) {
		var sid string

		// 1️⃣ Try the Authorization header.
		auth := c.GetHeader("Authorization")
		if auth != "" {
			// If it starts with "Bearer " (case‑insensitive) strip it.
			// Otherwise use the whole header value as the token.
			if strings.HasPrefix(strings.ToLower(auth), "bearer ") {
				sid = strings.TrimSpace(auth[7:])
			} else {
				sid = strings.TrimSpace(auth)
			}
		}

		// 2️⃣ Fallback to the custom header.
		if sid == "" {
			sid = c.GetHeader("X-Session-ID")
		}

		// 3️⃣ If still empty → reject.
		if sid == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing session id"})
			c.Abort()
			return
		}

		// 4️⃣ Validate the session.
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

		// Store the user ID (as hex string) for downstream handlers.
		c.Set("userID", sess.UserID.Hex())
		c.Next()
	}
}
