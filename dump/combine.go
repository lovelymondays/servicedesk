
func GetUserOrUsers(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	roleRaw, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Role not found in context"})
		return
	}
	role := roleRaw.(string)

	if role == "admin" {
		var users []models.User
		if err := models.DB.Find(&users).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
			return
		}

		for i := range users {
			users[i].Password = "" // hide passwords
		}

		c.JSON(http.StatusOK, users)
		return
	}

	// Reuse logic from GetCurrentUser for non-admins
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
