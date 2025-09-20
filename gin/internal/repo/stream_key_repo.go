package repo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

    "github.com/CSBOWMA/bigredhacks2025/gin/models"
)

// StreamKeyRepo wraps the Mongo collection for stream keys.
type StreamKeyRepo struct {
	col *mongo.Collection
}

// NewStreamKeyRepo creates a new repo.
func NewStreamKeyRepo(db *mongo.Database) *StreamKeyRepo {
	return &StreamKeyRepo{col: db.Collection("stream_keys")}
}

// Insert stores a new key (only the hash!).
func (r *StreamKeyRepo) Insert(ctx context.Context, key *models.StreamKey) error {
	_, err := r.col.InsertOne(ctx, key)
	return err
}

// FindByPlainKey returns the *first* non‑revoked key whose bcrypt hash matches plainKey.
func (r *StreamKeyRepo) FindByPlainKey(ctx context.Context, plainKey string) (*models.StreamKey, error) {
	// We cannot query the hash directly with bcrypt; we have to fetch all
	// non‑revoked keys for the user and test each one.
	//var keys []models.StreamKey
	filter := bson.M{"revoked": false}
	cur, err := r.col.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	for cur.Next(ctx) {
		var k models.StreamKey
		if err = cur.Decode(&k); err != nil {
			continue
		}
		// Compare the plain key with the stored hash.
		if err = bcrypt.CompareHashAndPassword([]byte(k.KeyHash), []byte(plainKey)); err == nil {
			return &k, nil
		}
	}
	return nil, mongo.ErrNoDocuments
}

// FindByUserID returns all (optionally non‑revoked) keys for a user.
func (r *StreamKeyRepo) FindByUserID(ctx context.Context, uid primitive.ObjectID, includeRevoked bool) ([]models.StreamKey, error) {
	filter := bson.M{"user_id": uid}
	if !includeRevoked {
		filter["revoked"] = false
	}
	cur, err := r.col.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var out []models.StreamKey
	if err = cur.All(ctx, &out); err != nil {
		return nil, err
	}
	return out, nil
}
