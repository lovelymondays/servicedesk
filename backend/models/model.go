package models

import (
	"log"
	"supportdesk/database"
	"supportdesk/migrations"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB is the global database instance
var DB *gorm.DB

// InitDB initializes the database connection and runs migrations
func InitDB() {
	var err error
	dsn := database.GetDatabaseURL()

	// Connect to the database
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("Connected to the database successfully")

	// Run migrations
	if err := migrations.RunMigrations(DB); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Seed the database
	if err := migrations.SeedDatabase(DB); err != nil {
		log.Fatalf("Failed to seed database: %v", err)
	}

	log.Println("Database initialization completed")
}