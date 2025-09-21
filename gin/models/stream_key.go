package models

import (

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// StreamKey is the secret a broadcaster sends to the RTMP server.
type StreamKey struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"user_id" bson:"user_id"`
}
