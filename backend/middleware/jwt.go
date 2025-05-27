package middleware

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"supportdesk/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// IMPORTANT: This secret MUST be the same one used to SIGN the tokens.
func getJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Println("Warning: JWT_SECRET environment variable not set. Using default insecure secret for development.")
		secret = "your-256-bit-secret" // CHANGE THIS IN PRODUCTION!
	}
	return []byte(secret)
}

// AuthMiddleware validates JWT tokens and sets user information in the context
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is missing"})
			c.Abort()
			return
		}

		parts := strings.Fields(authHeader) // strings.Fields handles multiple spaces better
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer {token}"})
			c.Abort()
			return
		}
		tokenString := parts[1]

		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return getJWTSecret(), nil
		})

		if err != nil {
			log.Printf("AuthMiddleware: Token parsing/validation error: %v", err)
			var errMsg string
			if errors.Is(err, jwt.ErrTokenMalformed) {
				errMsg = "Malformed token"
			} else if errors.Is(err, jwt.ErrTokenExpired) || errors.Is(err, jwt.ErrTokenNotValidYet) {
				errMsg = "Token is expired or not yet valid"
			} else if errors.Is(err, jwt.ErrTokenSignatureInvalid) {
				errMsg = "Invalid token signature (check JWT_SECRET consistency)"
			} else {
				errMsg = "Invalid token" // Generic fallback
			}
			c.JSON(http.StatusUnauthorized, gin.H{"error": errMsg})
			c.Abort()
			return
		}

		if !token.Valid { // This check is somewhat redundant if ParseWithClaims and key func are correct, but good as a safeguard.
			log.Println("AuthMiddleware: Token parsed but marked as invalid.")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token (post-parse validation failed)"})
			c.Abort()
			return
		}

		// Extract user_id from claims - check both possible claim keys
		var userID uint
		if userIDFloat, ok := claims["user_id"].(float64); ok {
			userID = uint(userIDFloat)
		} else if idFloat, ok := claims["id"].(float64); ok {
			userID = uint(idFloat)
		} else {
			log.Printf("AuthMiddleware: user_id claim is missing or not a float64. Claims: %+v", claims)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token: 'user_id' claim issue"})
			c.Abort()
			return
		}

		// Get the user from the database to ensure they still exist and roles are current
		user, err := models.GetUserByID(userID) // This now can return models.ErrUserNotFound
		if err != nil {
			log.Printf("AuthMiddleware: Failed to get user by ID %d from DB: %v", userID, err)
			
			if errors.Is(err, models.ErrUserNotFound) { // Check for your custom error
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token: User associated with this token not found"})
			} else {
				// For any other database error (connection issue, query problem, etc.)
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token: Error validating user with database"})
			}
			c.Abort()
			return
		}

		// Set user information in the context
		c.Set("user_id", user.ID) // Used by controllers
		c.Set("role", user.Role)   // Used by AdminOnly middleware and controllers

		c.Next()
	}
}

// AdminOnly middleware ensures that only admin users can access the route
func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		roleFromContext, exists := c.Get("role")
		if !exists {
			log.Println("AdminOnly: 'role' not found in context. AuthMiddleware might not have run or set it.")
			// This indicates a potential issue with how AuthMiddleware is applied or functions.
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: User role not determined"})
			c.Abort()
			return
		}

		role, ok := roleFromContext.(string)
		if !ok {
			log.Printf("AdminOnly: 'role' in context is not a string. Actual type: %T, Value: %v", roleFromContext, roleFromContext)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error: User role processing failed"})
			c.Abort()
			return
		}

		if role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: Admin privileges required"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// GenerateToken should be THE function used to create JWTs (e.g., in your Login controller)
func GenerateToken(user models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"id":      user.ID,   // Keep both for compatibility
		"role":    user.Role, // Good to include for quick checks, though AuthMiddleware re-verifies from DB
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
		"iat":     time.Now().Unix(), // Issued At
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTSecret())
}