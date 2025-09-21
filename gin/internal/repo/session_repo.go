package repo

import (
	"context"

	"github.com/CSBOWMA/bigredhacks2025/gin/internal/db"
	"github.com/CSBOWMA/bigredhacks2025/gin/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// CreateSession inserts a new session document.
func CreateSession(ctx context.Context, session *models.Session) error {
	collection := db.DB().Collection("sessions")
	_, err := collection.InsertOne(ctx, session)
	return err
}

// GetSession retrieves a session by its UUID (the _id field).
func GetSession(ctx context.Context, sessionID string) (*models.Session, error) {
	collection := db.DB().Collection("sessions")
	var sess models.Session
	err := collection.FindOne(ctx, bson.M{"_id": sessionID}).Decode(&sess)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &sess, nil
}
