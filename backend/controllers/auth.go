package controllers

import (
	"log"
	"net/http"
	"os"
	"time"

	"supportdesk/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Login handles user authentication
func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Login: Invalid input format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email or password format"})
		return
	}

	log.Printf("Login attempt for email: %s", input.Email)

	user, err := models.GetUserByEmail(input.Email)
	if err != nil {
		log.Printf("Login: User not found: %s, error: %v", input.Email, err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if err := user.CheckPassword(input.Password); err != nil {
		log.Printf("Login: Invalid password for user: %s", input.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(), // Token expires in 24 hours
	})

	// Get the secret key from environment variable or use a default for development
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-256-bit-secret" // Change this in production
	}

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		log.Printf("Login: Failed to generate token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	log.Printf("Login successful for user: %s with role: %s", user.Email, user.Role)

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

// Register handles user registration
func Register(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Register: Invalid input format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already exists
	if _, err := models.GetUserByEmail(input.Email); err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already registered"})
		return
	}

	// Create new user
	user, err := models.CreateUser(input.Email, input.Password, "user")
	if err != nil {
		log.Printf("Register: Failed to create user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	log.Printf("New user registered: %s with role: %s", user.Email, user.Role)

	c.JSON(http.StatusCreated, gin.H{
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

// GetCurrentUser returns the current authenticated user
func GetCurrentUser(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	user, err := models.GetUserByID(userID.(uint))
	if err != nil {
		log.Printf("GetCurrentUser: Failed to get user by ID %v: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user details"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":    user.ID,
		"email": user.Email,
		"role":  user.Role,
	})
} 