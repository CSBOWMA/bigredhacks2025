package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/CSBOWMA/bigredhacks2025/gin/internal/service"
	"github.com/CSBOWMA/bigredhacks2025/gin/models"
	"golang.org/x/crypto/bcrypt"
	"go.mongodb.org/mongo-driver/mongo"
)

// RegisterRequest is the JSON payload expected for the /auth/register endpoint.
type RegisterRequest struct {
	Username  string `json:"username" binding:"required,alphanum,min=3,max=20"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=6"`
}
// Register godoc
// @Summary      Register a new user
// @Description  Creates a user document with a bcrypt‑hashed password.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        user body RegisterRequest true "User payload"
// @Success      201  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /auth/register [post]
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ----- hash the password -----
	hashedPwd, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	// ----- build the model -----
	user := models.User{
		Username:     req.Username,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Email:        req.Email,
		PasswordHash: string(hashedPwd),
	}

	// ----- persist -----
	if err := service.CreateUser(c.Request.Context(), &user); err != nil {
		// Mongo duplicate key error (code 11000) -> return 409 Conflict
		if mongo.IsDuplicateKeyError(err) {
			c.JSON(http.StatusConflict, gin.H{"error": "username or email already taken"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "user created",
		"id":      user.ID.Hex(),
		"username": user.Username,
	})
}
