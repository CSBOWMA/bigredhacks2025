package db

import (
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
    "log"
    "github.com/CSBOWMA/bigredhacks2025/gin/pkg/models"
)

var DB *gorm.DB

func Init() {
    var err error
    // SQLite stored in a volume so it persists across container restarts.
    DB, err = gorm.Open(sqlite.Open("/data/stream.db"), &gorm.Config{})
    if err != nil {
        log.Fatalf("failed to connect to DB: %v", err)
    }

    // Auto‑migrate the models we need.
    if err := DB.AutoMigrate(&models.StreamKey{}); err != nil {
        log.Fatalf("failed to migrate DB: %v", err)
    }
}
