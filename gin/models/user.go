package models

// User is a simple data model used by the handlers.
// In a real project you might add `gorm` tags or other ORM metadata.
type User struct {
    ID        int    `json:"id"`
    FirstName string `json:"first_name"`
    LastName  string `json:"last_name"`
    Email     string `json:"email"`
}
