package controllers

import (
	"log"
	"net/http"
	"strings"

	"supportdesk/models"

	"github.com/gin-gonic/gin"
)

// GetTasks handles fetching tasks for a specific category
func GetTasks(c *gin.Context) {
	var tasks []models.Task
	category := strings.TrimPrefix(c.Request.URL.Path, "/api/dashboard/")
	category = strings.Split(category, "/")[0]

	// Get user role to determine which tasks to show
	userRole, roleExists := c.Get("role")
	
	var query = models.DB.Where("category = ?", category)
	
	// If user is not admin, only show approved tasks
	if !roleExists || userRole != "admin" {
		query = query.Where("status = ?", "approved")
	}

	if err := query.Preload("User").Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching tasks"})
		return
	}

	c.JSON(http.StatusOK, tasks)
}

// GetTask handles fetching a single task
func GetTask(c *gin.Context) {
	var task models.Task
	category := strings.TrimPrefix(c.Request.URL.Path, "/api/dashboard/")
	category = strings.Split(category, "/")[0]

	// Get user role to determine access
	userRole, roleExists := c.Get("role")
	
	query := models.DB.Where("id = ? AND category = ?", c.Param("id"), category)
	
	// If user is not admin, only show approved tasks
	if !roleExists || userRole != "admin" {
		query = query.Where("status = ?", "approved")
	}

	if err := query.Preload("User").First(&task).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	c.JSON(http.StatusOK, task)
}

// CreateTask handles creating a new task
func CreateTask(c *gin.Context) {
	var task models.Task
	category := strings.TrimPrefix(c.Request.URL.Path, "/api/dashboard/")
	category = strings.Split(category, "/")[0]

	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get the authenticated user's ID from the context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get user role
	userRole, roleExists := c.Get("role")
	if !roleExists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User role not found"})
		return
	}

	// Set the user ID and category
	task.UserID = userID.(uint)
	task.Category = category

	// Set status based on user role
	if userRole == "admin" {
		task.Status = "approved" // Admin posts are auto-approved
	} else {
		task.Status = "pending" // Regular user posts need approval
	}

	if err := models.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating task"})
		return
	}

	// Fetch the created task with user information
	var createdTask models.Task
	if err := models.DB.Preload("User").First(&createdTask, task.ID).Error; err != nil {
		log.Printf("Warning: Could not fetch created task with user info: %v", err)
		// Still return the task without user info
		c.JSON(http.StatusCreated, task)
		return
	}

	c.JSON(http.StatusCreated, createdTask)
}

// UpdateTask handles updating an existing task (Admin only)
func UpdateTask(c *gin.Context) {
	var task models.Task
	category := strings.TrimPrefix(c.Request.URL.Path, "/api/dashboard/")
	category = strings.Split(category, "/")[0]

	taskID := c.Param("id")
	if taskID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Task ID is required"})
		return
	}

	// Get the existing task
	if err := models.DB.Where("id = ? AND category = ?", taskID, category).First(&task).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	// Check if user is authenticated
	if _, exists := c.Get("user_id"); !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Bind the update data to a TaskRequest struct
	var updateReq models.TaskRequest
	if err := c.ShouldBindJSON(&updateReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update the task using the model's UpdateTask function
	updatedTask, err := models.UpdateTask(task.ID, updateReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedTask)
}

// DeleteTask handles deleting a task (Admin only)
func DeleteTask(c *gin.Context) {
	var task models.Task
	category := strings.TrimPrefix(c.Request.URL.Path, "/api/dashboard/")
	category = strings.Split(category, "/")[0]

	if err := models.DB.Where("id = ? AND category = ?", c.Param("id"), category).First(&task).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	if err := models.DB.Delete(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting task"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
}

// ApproveTask handles approving a pending task (Admin only)
func ApproveTask(c *gin.Context) {
	var task models.Task
	category := strings.TrimPrefix(c.Request.URL.Path, "/api/dashboard/")
	category = strings.Split(category, "/")[0]

	taskID := c.Param("id")
	if err := models.DB.Where("id = ? AND category = ?", taskID, category).First(&task).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	// Update status to approved
	task.Status = "approved"
	if err := models.DB.Save(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error approving task"})
		return
	}

	// Fetch task with user information
	if err := models.DB.Preload("User").First(&task, task.ID).Error; err != nil {
		log.Printf("Warning: Could not fetch approved task with user info: %v", err)
	}

	c.JSON(http.StatusOK, task)
}

// RejectTask handles rejecting a pending task (Admin only)
func RejectTask(c *gin.Context) {
	var task models.Task
	category := strings.TrimPrefix(c.Request.URL.Path, "/api/dashboard/")
	category = strings.Split(category, "/")[0]

	taskID := c.Param("id")
	if err := models.DB.Where("id = ? AND category = ?", taskID, category).First(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Task not found"})
		return
	}

	// Get rejection reason from request body
	var reqBody struct {
		Reason string `json:"reason"`
	}
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Update status to rejected
	task.Status = "rejected"
	if err := models.DB.Save(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error rejecting task"})
		return
	}

	// Fetch task with user information
	if err := models.DB.Preload("User").First(&task, task.ID).Error; err != nil {
		log.Printf("Warning: Could not fetch rejected task with user info: %v", err)
	}

	c.JSON(http.StatusOK, task)
}

// GetPendingTasks handles fetching all pending tasks (Admin only)
func GetPendingTasks(c *gin.Context) {
	var tasks []models.Task
	
	if err := models.DB.Where("status = ?", "pending").Preload("User").Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching pending tasks"})
		return
	}

	c.JSON(http.StatusOK, tasks)
}