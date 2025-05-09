package config

import (
	"log"
	"supportdesk/database"
	"supportdesk/models"
)

// InitDB initializes the database connection
func InitDB() {
	models.InitDB()
	log.Println("Database initialization completed")
}

// GetDatabaseURL returns the database connection URL by delegating to the database package
func GetDatabaseURL() string {
	return database.GetDatabaseURL()
} 