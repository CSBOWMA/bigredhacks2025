// backend/pkg/keys/keys.go
package keys

import (
    "crypto/rand"
    "encoding/base64"
    "golang.org/x/crypto/bcrypt"
)

// GenerateStreamKey returns a plain (random) key and its bcrypt hash.
// The plain key is shown to the user **once**; the hash is what we store.
func GenerateStreamKey() (plain string, hash string, err error) {
    // 32 random bytes = 256‑bit secret
    b := make([]byte, 32)
    _, err = rand.Read(b)
    if err != nil {
        return "", "", err
    }

    // URL‑safe base64 without padding (easy to copy/paste)
    plain = base64.RawURLEncoding.EncodeToString(b)

    // bcrypt with the default cost (you can increase it for extra security)
    hashedBytes, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
    if err != nil {
        return "", "", err
    }
    hash = string(hashedBytes)
    return plain, hash, nil
}
