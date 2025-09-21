package repo

import (
	"context"

	"github.com/CSBOWMA/bigredhacks2025/gin/internal/db"
	"github.com/CSBOWMA/bigredhacks2025/gin/models"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func HexToObjectID(hex string) (primitive.ObjectID, error) {
	return primitive.ObjectIDFromHex(hex)
}

// CreateUser inserts a new user document into the "users" collection.
func CreateUser(ctx context.Context, user *models.User) error {
	collection := db.DB().Collection("users")
	_, err := collection.InsertOne(ctx, user)
	if err != nil {
		// If you want more granular errors you can inspect the mongo.WriteError
		// but for a hackathon a simple wrap is enough.
		return err
	}
	return nil
}
func FindUserByEmailOrUsername(ctx context.Context, email, username string) (*models.User, error) {
	collection := db.DB().Collection("users")

	filter := bson.M{}
	if email != "" {
		filter["email"] = email
	}
	if username != "" {
		filter["username"] = username
	}

	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // not found – caller can decide to return 401
		}
		return nil, err
	}
	return &user, nil
}
