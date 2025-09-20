package db

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
    "go.mongodb.org/mongo-driver/bson"
)

var client *mongo.Client

// Connect creates a shared *mongo.Client using the supplied URI.
// The URI is normally read from the env variable MONGODB_URI.
// It also pings the server to verify the connection.
func Connect(uri string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// reasonable defaults for a hackathon – you can tweak them later
	clientOptions := options.Client().
		ApplyURI(uri).
		SetMaxPoolSize(100).
		SetMinPoolSize(10).
		SetConnectTimeout(5 * time.Second)

	var err error
	client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		return err
	}

	// Ping to be sure we really connected
	if err = client.Ping(ctx, nil); err != nil {
		return err
	}
    err = ensureUserIndexes()
		if err != nil {
			// If we cannot create indexes we consider it a fatal error.
			log.Printf("db: failed to create user indexes: %v", err)
			_ = client.Disconnect(context.Background())
			client = nil
			return nil
		}
	log.Println("✅ Connected to MongoDB Atlas")
	return nil
}

// Get returns the shared *mongo.Client.
// Panics if Connect has not been called first.
func Get() *mongo.Client {
	if client == nil {
		panic("mongo client not initialised – call db.Connect first")
	}
	return client
}

// DB returns the *mongo.Database that the app uses.
// The database name can be overridden with the env var MONGODB_DB;
// otherwise it defaults to "streaming_app".
func DB() *mongo.Database {
	name := os.Getenv("MONGODB_DB")
	if name == "" {
		name = "streaming_app"
	}
	return Get().Database(name)
}

// Close disconnects the client (useful for tests or graceful shutdown).
func Close() error {
	if client == nil {
		return nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return client.Disconnect(ctx)
}// In internal/db/mongo.go – add after the client is connected

func ensureUserIndexes() error {
    coll := DB().Collection("users")

    // Unique index on email
    _, err := coll.Indexes().CreateOne(context.Background(),
        mongo.IndexModel{
            Keys:    bson.D{{Key: "email", Value: 1}},
            Options: options.Index().SetUnique(true),
        },
    )
    if err != nil {
        return err
    }

    // Unique index on username
    _, err = coll.Indexes().CreateOne(context.Background(),
        mongo.IndexModel{
            Keys:    bson.D{{Key: "username", Value: 1}},
            Options: options.Index().SetUnique(true),
        },
    )
    return err
}
