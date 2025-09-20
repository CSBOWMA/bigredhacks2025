package models

import "time"

// StreamKey is the DB representation of an RTMP secret.
// The plain secret is never stored – only its bcrypt hash.
type StreamKey struct {
    ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
    UserID    uint      `json:"-" gorm:"index"`               // owner of the key
    KeyHash   string    `json:"-" gorm:"type:varchar(255);not null;unique"`
    RevokedAt *time.Time `json:"-" gorm:"default:null"`      // nil = active
    CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
    UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}
