package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/CSBOWMA/bigredhacks2025/gin/internal/service"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetStreamKey godoc
// @Summary      Retrieve or create a stream key for the authenticated user.
// @Description  If the user already has a key it is returned; otherwise a new key is created.
// @Tags         stream-key
// @Accept       json
// @Produce      json
// @Success      200 {object} map[string]string
// @Failure      401 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /stream-key [get]
func GetStreamKey(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	// Convert the string back to a primitive.ObjectID.
	objID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user id"})
		return
	}

	key, err := service.GetOrCreateStreamKey(c.Request.Context(), objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get/create stream key"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"stream_key": key.ID.Hex(),
	})
}

// NewStreamKey godoc
// @Summary      Generate a new stream key, replacing any old one.
// @Description  Deletes the current key (if any) and returns a fresh key.
// @Tags         stream-key
// @Accept       json
// @Produce      json
// @Success      200 {object} map[string]string
// @Failure      401 {object} map[string]string
// @Failure      500 {object} map[string]string
// @Router       /stream-key/new [post]
func NewStreamKey(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	objID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user id"})
		return
	}

	key, err := service.ReplaceStreamKey(c.Request.Context(), objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to replace stream key"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"stream_key": key.ID.Hex(),
	})
}
