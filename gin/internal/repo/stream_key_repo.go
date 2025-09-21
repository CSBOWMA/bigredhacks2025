package repo

import (
	"context"
 
	"github.com/CSBOWMA/bigredhacks2025/gin/internal/db"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"github.com/CSBOWMA/bigredhacks2025/gin/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// FindStreamKeyByUserID returns the active stream key for a user (or nil).
func FindStreamKeyByUserID(ctx context.Context, userID primitive.ObjectID) (*models.StreamKey, error) {
	coll := db.DB().Collection("stream_keys")
	filter := bson.M{"user_id": userID}

	var key models.StreamKey
	err := coll.FindOne(ctx, filter).Decode(&key)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &key, nil
}

// CreateStreamKey inserts a new document **and fills the ID field**.
func CreateStreamKey(ctx context.Context, key *models.StreamKey) error {
	coll := db.DB().Collection("stream_keys")
	res, err := coll.InsertOne(ctx, key)
	if err != nil {
		return err
	}
	if id, ok := res.InsertedID.(primitive.ObjectID); ok {
		key.ID = id
	}
	return nil
}

// DeleteStreamKeyByUserID removes any existing key for the user.
func DeleteStreamKeyByUserID(ctx context.Context, userID primitive.ObjectID) error {
	coll := db.DB().Collection("stream_keys")
	filter := bson.M{"user_id": userID}
	_, err := coll.DeleteOne(ctx, filter)
	return err
}
