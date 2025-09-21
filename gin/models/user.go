package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User is the JSON representation we expose.
// The BSON tag tells Mongo how to store the fields.
type User struct {
	ID           primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Username     string             `json:"username" bson:"username"`
	FirstName    string             `json:"first_name" bson:"first_name"`
	LastName     string             `json:"last_name" bson:"last_name"`
	Email        string             `json:"email" bson:"email"`
	PasswordHash string             `json:"-" bson:"password_hash"` // omitted from JSON
}
