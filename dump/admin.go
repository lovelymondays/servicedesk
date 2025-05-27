package config

import (
	"log"
	"supportdesk/models"

	"gorm.io/gorm"
)

// InitAdminUser creates the default admin user if it doesn't exist
func InitAdminUser() {
	var adminUser models.User
	result := models.DB.Where("email = ?", "admin@supportdesk.com").First(&adminUser)
	if result.Error == gorm.ErrRecordNotFound {
		adminUser = models.User{
			Email: "admin@supportdesk.com",
			Role:  "admin",
		}
		adminUser.SetPassword("admin1234") // Change this in production
		if err := models.DB.Create(&adminUser).Error; err != nil {
			log.Printf("Failed to create admin user: %v", err)
			return
		}
		log.Println("Admin user created successfully")
	}
} 