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

	if err := models.DB.Where("category = ?", category).Find(&tasks).Error; err != nil {
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

	if err := models.DB.Where("id = ? AND category = ?", c.Param("id"), category).First(&task).Error; err != nil {
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
	userID, exists := c.Get(" ")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Set the user ID and category
	task.UserID = userID.(uint)
	task.Category = category

	if err := models.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating task"})
		return
	}

	// After creating the task, update the seed file
	if err := models.UpdateSeedFile(); err != nil {
		// Log the error but don't fail the request
		log.Printf("Warning: Failed to update seed file: %v", err)
	}

	c.JSON(http.StatusCreated, task)
}

// UpdateTask handles updating an existing task
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

// DeleteTask handles deleting a task
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