package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Load reads a .env file (if it exists) and returns a map of the variables.
// It also populates the process environment so that later os.Getenv calls work.
func Load() map[string]string {
	// The path can be customised; "./.env" works when you run from the repo root.
	err := godotenv.Load("./.env")
	if err != nil && !os.IsNotExist(err) {
		log.Fatalf("� error loading .env file: %v", err)
	}

	// Build a map of all env vars that we care about.
	env := make(map[string]string)
	for _, pair := range []string{
		"MONGODB_URI",
		"MONGODB_DB",
		"PORT",
		"JWT_SECRET",
	} {
		env[pair] = os.Getenv(pair)
		if env[pair] == "" {
			log.Printf("� warning: environment variable %s not set", pair)
		}
	}
	return env
}
