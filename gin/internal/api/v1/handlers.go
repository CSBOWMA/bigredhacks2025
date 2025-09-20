package v1

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
    "github.com/CSBOWMA/bigredhacks2025/gin/pkg/models"
)

// In a real app you would talk to a DB here.
// For this demo we just store data in memory.
var userStore = map[int]models.User{}

// GetUsers returns all users
func GetUsers(c *gin.Context) {
    var users []models.User
    for _, u := range userStore {
        users = append(users, u)
    }
    c.JSON(http.StatusOK, gin.H{"data": users})
}

// CreateUser creates a new user
func CreateUser(c *gin.Context) {
    var req models.User
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Simple ID generation (auto‑increment)
    nextID := len(userStore) + 1
    req.ID = nextID

    userStore[nextID] = req
    c.JSON(http.StatusCreated, gin.H{"data": req})
}

// GetUserByID returns a single user
func GetUserByID(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }

    user, ok := userStore[id]
    if !ok {
        c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": user})
}

// UpdateUser updates an existing user
func UpdateUser(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }

    var req models.User
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if _, ok := userStore[id]; !ok {
        c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
        return
    }

    req.ID = id
    userStore[id] = req
    c.JSON(http.StatusOK, gin.H{"data": req})
}

// DeleteUser removes a user
func DeleteUser(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
        return
    }

    if _, ok := userStore[id]; !ok {
        c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
        return
    }

    delete(userStore, id)
    c.JSON(http.StatusNoContent, nil)
}

// HealthCheck is a tiny endpoint used by load balancers / Docker healthchecks
func HealthCheck(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
