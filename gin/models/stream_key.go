package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// StreamKey is the secret a broadcaster sends to the RTMP server.
// Only the **bcrypt hash** of the key is persisted; the plain key is shown
// to the user exactly once.
type StreamKey struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"user_id" bson:"user_id"`
	KeyHash   string             `json:"-" bson:"key_hash"` // never marshalled to JSON
	Name      string             `json:"name" bson:"name"` // optional label
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	Revoked   bool               `json:"revoked" bson:"revoked"`
}
