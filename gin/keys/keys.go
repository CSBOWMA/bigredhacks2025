package keys

import (
	"crypto/rand"
	"encoding/base64"
	"golang.org/x/crypto/bcrypt"
)

// GenerateStreamKey returns a cryptographically random plain key,
// a bcrypt hash of that key, and an error (if any).
func GenerateStreamKey() (plain string, hashed string, err error) {
	// 24 random bytes -> 32 char base64 URL string
	b := make([]byte, 24)
	_, err = rand.Read(b)
	if err != nil {
		return "", "", err
	}
	plain = base64.RawURLEncoding.EncodeToString(b)

	// bcrypt cost 10 is a good trade‑off for a hackathon
	hash, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
	if err != nil {
		return "", "", err
	}
	return plain, string(hash), nil
}
