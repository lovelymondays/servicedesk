package migrations

import (
	"gorm.io/gorm"
)

// CreateUsersTable creates the users table
func CreateUsersTable(db *gorm.DB) error {
	return db.AutoMigrate(&User{})
}

// User represents a user in the system
type User struct {
	gorm.Model
	Email    string `gorm:"uniqueIndex;not null"`
	Password string `gorm:"not null"`
	Role     string `gorm:"default:'user'"`
}

// TableName specifies the table name for User
func (User) TableName() string {
	return "users"
} 