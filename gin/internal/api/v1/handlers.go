package v1

import (
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
    "github.com/CSBOWMA/bigredhacks2025/gin/internal/db"
    "github.com/CSBOWMA/bigredhacks2025/gin/pkg/keys"
    "github.com/CSBOWMA/bigredhacks2025/gin/pkg/models"
    "golang.org/x/crypto/bcrypt"
)

// ---------- 1️⃣ Create a new RTMP key ----------
func CreateKey(c *gin.Context) {
    // In a real app you would extract the user ID from an auth token.
    userID, _ := c.Get("user_id")
    uid := userID.(uint)

    plain, hash, err := keys.GenerateStreamKey()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate key"})
        return
    }

    key := models.StreamKey{
        UserID:  uid,
        KeyHash: hash,
    }
    if err := db.DB.Create(&key).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to store key"})
        return
    }

    // Show the plain key ONLY ONCE.
    c.JSON(http.StatusCreated, gin.H{
        "message": "keep this key safe – you will not see it again",
        "key":     plain,
    })
}

// ---------- 2️⃣ Issue a JWT for HLS playback ----------
type Claims struct {
    UserID uint `json:"uid"`
    jwt.RegisteredClaims
}

var jwtSecret = []byte("super-secret-change-me") // read from env in prod

func IssueToken(c *gin.Context) {
    uid, _ := c.Get("user_id")
    userID := uid.(uint)

    exp := time.Now().Add(15 * time.Minute)
    claims := Claims{
        UserID: userID,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(exp),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    signed, err := token.SignedString(jwtSecret)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to sign token"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"token": signed})
}

// ---------- 3️⃣ Validate the RTMP key (called by nginx‑rtmp) ----------
func ValidateKey(c *gin.Context) {
    keyPlain := c.Query("key")
    if keyPlain == "" {
        c.Status(http.StatusForbidden)
        return
    }

    // Look up the hash that matches the plain key.
    var stored models.StreamKey
    if err := db.DB.Where("key_hash = ?", keyPlain).First(&stored).Error; err != nil {
        c.Status(http.StatusForbidden)
        return
    }

    // Compare the supplied plain key with the stored bcrypt hash.
    if err := bcrypt.CompareHashAndPassword([]byte(stored.KeyHash), []byte(keyPlain)); err != nil {
        c.Status(http.StatusForbidden)
        return
    }

    // Optional: reject revoked keys.
    if stored.RevokedAt != nil {
        c.Status(http.StatusForbidden)
        return
    }

    c.Status(http.StatusOK)
}

// ---------- 4️⃣ Validate the JWT (called by nginx via auth_request) ----------
func ValidateToken(c *gin.Context) {
    tokenString := c.Query("token")
    if tokenString == "" {
        c.Status(http.StatusForbidden)
        return
    }

    claims := &Claims{}
    token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
        if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, jwt.ErrSignatureInvalid
        }
        return jwtSecret, nil
    })

    if err != nil || !token.Valid {
        c.Status(http.StatusForbidden)
        return
    }

    // (Optional) you could also enforce that the user ID in the JWT
    // matches the stream ID requested in the URL.
    c.Status(http.StatusOK)
}
