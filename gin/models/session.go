package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Session is now just a mapping from a UUID string to a user ID.
type Session struct {
	ID     string               `json:"session_id" bson:"_id"` // the UUID we return to the client
	UserID primitive.ObjectID   `json:"user_id"   bson:"user_id"`
}
