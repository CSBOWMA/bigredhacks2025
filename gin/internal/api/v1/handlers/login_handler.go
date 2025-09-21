package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/CSBOWMA/bigredhacks2025/gin/internal/service"
)

// LoginRequest payload for /auth/login
type LoginRequest struct {
	EmailOrUsername string `json:"email_or_username" binding:"required"`
	Password        string `json:"password" binding:"required"`
}

// Login godoc
// @Summary      Log in a user
// @Description  Validates credentials, creates a session entry and returns a session_id.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        payload body LoginRequest true "Login credentials"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /auth/login [post]
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ----- authenticate user -----
	authReq := service.LoginRequest{
		EmailOrUsername: req.EmailOrUsername,
		Password:        req.Password,
	}
	user, err := service.Authenticate(c.Request.Context(), &authReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}
	if user == nil {
		// Invalid credentials – generic message for security.
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	// ----- create a session -----
	// Convert user.ID (primitive.ObjectID) to a hex string for the service.
	sid, err := service.CreateSession(c.Request.Context(), user.ID.Hex())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"session_id": sid,
		"user_id":    user.ID.Hex(),
	})
}
