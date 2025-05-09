package migrations

import (
	"gorm.io/gorm"
)

// CreateTasksTable creates the tasks table
func CreateTasksTable(db *gorm.DB) error {
	// First create the table without NOT NULL constraint
	if err := db.AutoMigrate(&Task{}); err != nil {
		return err
	}

	// Update any NULL types to a default value
	if err := db.Model(&Task{}).Where("type IS NULL").Update("type", "Q&A").Error; err != nil {
		return err
	}

	// Now add the NOT NULL constraint
	return db.Exec("ALTER TABLE tasks ALTER COLUMN type SET NOT NULL").Error
}

// Task represents a support task in the system
type Task struct {
	gorm.Model
	Title       string   `gorm:"not null"`
	Description string
	Content     string   `gorm:"type:text"`
	Type        string   `gorm:"type:text"`
	Category    string   `gorm:"index;not null"`
	Status      string   `gorm:"default:'pending'"`
	Rating      float64  `gorm:"default:0"`
	Keywords    []string `gorm:"type:text[]"`
	UserID      uint
	User        User     `gorm:"foreignKey:UserID"`
} 