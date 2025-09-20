package service

import (
	"context"

	"github.com/CSBOWMA/bigredhacks2025/gin/internal/repo"
	"github.com/CSBOWMA/bigredhacks2025/gin/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetOrCreateStreamKey returns the current key, creating one if it does not exist.
func GetOrCreateStreamKey(ctx context.Context, userID primitive.ObjectID) (*models.StreamKey, error) {
	key, err := repo.FindStreamKeyByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if key != nil {
		return key, nil
	}

	newKey := &models.StreamKey{
		UserID: userID,
	}
	if err := repo.CreateStreamKey(ctx, newKey); err != nil {
		return nil, err
	}
	return newKey, nil
}

// ReplaceStreamKey **rotates** the key: it deletes the old one (if any) and
// creates a fresh key, returning the newly generated key.
func ReplaceStreamKey(ctx context.Context, userID primitive.ObjectID) (*models.StreamKey, error) {
	// 1️⃣ Delete any existing key – ignore "not found" errors.
	_ = repo.DeleteStreamKeyByUserID(ctx, userID)

	// 2️⃣ Create a brand‑new key.
	newKey := &models.StreamKey{
		UserID: userID,
	}
	if err := repo.CreateStreamKey(ctx, newKey); err != nil {
		return nil, err
	}
	return newKey, nil
}
