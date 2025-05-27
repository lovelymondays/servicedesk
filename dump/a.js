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

		// Extract user_id from claims
		userIDFloat, ok := claims["id"].(float64) // JWT numbers are often float64
		if !ok {
			log.Printf("AuthMiddleware: user_id claim is missing or not a float64. Claims: %+v", claims)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token: 'user_id' claim issue"})
			c.Abort()
			return
		}
		userID := uint(userIDFloat)

		// Get the user role from claims (optional, but can be useful for AdminOnly before DB hit)
		// roleFromClaims, _ := claims["role"].(string)

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
		c.Set("user_id", user.ID) // Used by controllers.GetCurrentUser
		c.Set("role", user.Role)   // Used by AdminOnly middleware

		c.Next()
	}
}