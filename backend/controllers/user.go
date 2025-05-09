package controllers

import (
	"net/http"
	"supportdesk/models"

	"github.com/gin-gonic/gin"
)

// GetUsers returns a list of all users
func GetUsers(c *gin.Context) {
	var users []models.User
	if err := models.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	// Remove sensitive information
	for i := range users {
		users[i].Password = ""
	}

	c.JSON(http.StatusOK, users)
} 