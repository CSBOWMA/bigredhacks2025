package service

import (
	"context"

	"github.com/CSBOWMA/bigredhacks2025/gin/internal/repo"
	"github.com/CSBOWMA/bigredhacks2025/gin/models"
	"golang.org/x/crypto/bcrypt"

)

type LoginRequest struct {
	EmailOrUsername string
	Password        string
}

// CreateUser creates a user record in the DB.
// At the moment it simply forwards to the repo; you can add
// validation, duplicate‑email checks, etc. here later.
func CreateUser(ctx context.Context, user *models.User) error {
	return repo.CreateUser(ctx, user)
}

func Authenticate(ctx context.Context, lr *LoginRequest) (*models.User, error) {
	// Find user by email first; if not found try username.
	user, err := repo.FindUserByEmailOrUsername(ctx, lr.EmailOrUsername, "")
	if err != nil {
		return nil, err
	}
	if user == nil {
		// If not found by email, try by username.
		user, err = repo.FindUserByEmailOrUsername(ctx, "", lr.EmailOrUsername)
		if err != nil {
			return nil, err
		}
		if user == nil {
			return nil, nil // no user matches the supplied identifier
		}
	}

	// Compare password hash.
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(lr.Password)); err != nil {
		return nil, nil // wrong password
	}
	return user, nil
}
