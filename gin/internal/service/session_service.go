package service

import (
	"context"

	"github.com/CSBOWMA/bigredhacks2025/gin/internal/repo"
	"github.com/CSBOWMA/bigredhacks2025/gin/models"
	"github.com/google/uuid"
)

// CreateSession creates a new session for the given user ID and returns the UUID.
func CreateSession(ctx context.Context, userID string) (string, error) {
	// userID comes in as a hex string; we convert it back to ObjectID for storage.
	objID, err := repo.HexToObjectID(userID) // helper added below
	if err != nil {
		return "", err
	}

	sid := uuid.NewString() // plain UUID v4

	session := models.Session{
		ID:     sid,
		UserID: objID,
	}

	if err := repo.CreateSession(ctx, &session); err != nil {
		return "", err
	}
	return sid, nil
}

// ValidateSession checks that a session with the given UUID exists.
// It returns the stored Session (or nil) and any error.
func ValidateSession(ctx context.Context, sid string) (*models.Session, error) {
	return repo.GetSession(ctx, sid)
}
